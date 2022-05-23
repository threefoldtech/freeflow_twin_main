import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiService } from '../api/api.service';
import { ContactService } from '../contact/contact.service';
import { KeyService } from '../key/key.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { stringifyMessage } from '../message/models/message.model';
import { ChatGateway } from './chat.gateway';
import { ChatDTO, CreateChatDTO } from './dtos/chat.dto';
import { Chat, stringifyContacts } from './models/chat.model';
import { ChatRedisRepository } from './repositories/chat-redis.repository';

@Injectable()
export class ChatService {
    constructor(
        private _chatRepository: ChatRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _contactService: ContactService,
        private readonly _messageService: MessageService,
        private readonly _apiService: ApiService,
        private readonly _keyService: KeyService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly _chatGateway: ChatGateway
    ) {}

    /**
     * Creates a new chat.
     * @param {CreateChatDTO} createChatDTO - Chat data to create.
     * @return {Chat} - Created entity.
     */
    async createChat(createChatDTO: CreateChatDTO): Promise<Chat> {
        try {
            return await this._chatRepository.createChat(createChatDTO);
        } catch (error) {
            throw new BadRequestException(`unable to create chat: ${error}`);
        }
    }

    /**
     * Accepts a chat request.
     * @param {string} chatId - Chat Id.
     * @return {ChatDTO} - Accepted chat.
     */
    async acceptChatRequest(chatId: string): Promise<ChatDTO> {
        const chat = await this.getChat(chatId);
        const contacts = chat.parseContacts();
        const contact = contacts.find(c => c.id === chatId);
        try {
            if (contact) await this._contactService.addContact(contact);
            chat.acceptedChat = true;
            await this._chatRepository.updateChat(chat);
            this._chatGateway.emitMessageToConnectedClients('new_chat', chat.toJSON());
            return chat.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to accept chat request: ${error}`);
        }
    }

    /**
     * Gets chats using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 25.
     * @return {ChatDTO[]} - Found chats.
     */
    async getChats({ offset = 0, count = 25 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        try {
            const chats = await this._chatRepository.getChats({ offset, count });
            return chats.map(chat => chat.toJSON());
        } catch (error) {
            throw new NotFoundException('no chats found');
        }
    }

    /**
     * Gets accepted chats using pagination.
     * @param {Object} obj - Object.
     * @param {number }obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 25.
     * @return {Chat[]} - Found chats.
     */
    async getAcceptedChats({ offset = 0, count = 25 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        try {
            const chats = await this._chatRepository.getAcceptedChats({ offset, count });
            return chats.map(chat => chat.toJSON());
        } catch (error) {
            throw new NotFoundException('no accepted chats found');
        }
    }

    /**
     * Gets a chat by its ID.
     * @param {string} chatId - Chat ID.
     * @return {Chat} - Found chat.
     */
    async getChat(chatId: string): Promise<Chat> {
        try {
            return await this._chatRepository.getChat(chatId);
        } catch (error) {
            throw new ForbiddenException(`not in contacts`);
        }
    }

    /**
     * Gets messages from a chat by given chat Id.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to get messages from.
     * @param {string|null} obj.from - Optional from sender.
     * @param {number|null} obj.page - Optional page parameter.
     * @param {number} obj.limit - Limit, defaults to 50.
     */
    async getChatMessages({
        chatId,
        from,
        page,
        limit,
    }: {
        chatId: string;
        from: string | null;
        page: number | null;
        limit: number;
    }): Promise<{ hasMore: boolean; messages: MessageDTO<unknown>[] }> {
        const chat = await this.getChat(chatId);
        const parsedMessages = chat.parseMessages();

        let end = parsedMessages.length;
        if (page) end = parsedMessages.length - page * limit;
        else if (from) end = parsedMessages.findIndex(m => m.id === from);

        const start = end - limit;
        return {
            hasMore: start !== 0,
            messages: parsedMessages.slice(start, end),
        };
    }

    /**
     * Deletes a chat by its ID.
     * @param {string} chatId - Chat ID.
     */
    async deleteChat(chatId: string): Promise<void> {
        const chatToDelete = await this.getChat(chatId);
        try {
            await this._chatRepository.deleteChat(chatToDelete.entityId);
        } catch (error) {
            throw new InternalServerErrorException(`unable to delete chat: ${error}`);
        }
    }

    /**
     * Adds a message to a chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to add messages to.
     * @param {Message} obj.message - Signed message to add to chat.
     * @return {string} - Chat entity ID.
     */
    async addMessageToChat({ chat, message }: { chat: Chat; message: MessageDTO<unknown> }): Promise<string> {
        try {
            chat.messages
                ? chat.messages.push(stringifyMessage(message))
                : (chat.messages = [stringifyMessage(message)]);
            return await this._chatRepository.updateChat(chat);
        } catch (error) {
            throw new BadRequestException(`unable to add message to chat: ${error}`);
        }
    }

    /**
     * Removes a contact from a chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to remove contact from.
     * @param {string} obj.contactId - Contact to remove.
     */
    async removeContactFromChat({ chat, contactId }: { chat: Chat; contactId: string }) {
        try {
            const contacts = chat.parseContacts().filter(c => c.id !== contactId);
            chat.contacts = stringifyContacts(contacts);
            return await this._chatRepository.updateChat(chat);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    /**
     * Handles a message read.
     * @param {MessateDTO} message - Message that is read.
     */
    async handleMessageRead(message: MessageDTO<string>) {
        const chatId = this._messageService.determineChatID(message);
        const chat = await this.getChat(chatId);

        const chatMessages = chat.parseMessages();
        const newRead = chatMessages.find(m => m.id === message.body);
        const oldRead = chatMessages.find(m => m.id === chat.read[message.from]);

        if (oldRead && newRead && newRead.timeStamp.getTime() < oldRead.timeStamp.getTime()) {
            return;
        }

        chat.read[0] = message.body;
        this._chatGateway.emitMessageToConnectedClients('message', message);
        await this._chatRepository.updateChat(chat);
        return chat
    }

    /**
     * Get the group chat of the admin to sync it with new contacts in chat.
     * @param {Object} obj - Object.
     * @param {string} obj.adminLocation - External admin location to get chat from.
     * @param {string} obj.chatId - Chat ID to fetch from location.
     */
    async syncNewChatWithAdmin({ adminLocation, chatId }: { adminLocation: string; chatId: string }): Promise<Chat> {
        const chat = await this._apiService.getAdminChat({ location: adminLocation, chatId });
        this._chatGateway.emitMessageToConnectedClients('new_chat', chat);
        return await this._chatRepository.createChat(chat);
    }

    /**
     * Send a message to all contacts of a group chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to send message to.
     * @param {MessageDTO} obj.message - Message to send.
     */
    async handleGroupAdmin({ chat, message }: { chat: Chat; message: MessageDTO<unknown> }) {
        const contacts = chat.parseContacts();
        const validSignature = await this._messageService.verifySignedMessage({
            isGroup: false,
            adminContact: null,
            fromContact: contacts.find(c => c.id === message.from),
            signedMessage: message,
        });
        if (!validSignature) throw new BadRequestException(`failed to verify message signature`);

        const signedMessage = await this._keyService.appendSignatureToMessage({ message });
        const userId = this._configService.get<string>('userId');
        const receivingContacts = contacts.filter(c => c.id !== userId);
        await Promise.all(
            receivingContacts.map(async c => {
                await this._apiService.sendMessageToApi({ location: c.location, message: signedMessage });
            })
        );
    }
}
