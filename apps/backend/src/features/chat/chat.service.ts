import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiService } from '../api/api.service';
import { ContactService } from '../contact/contact.service';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { KeyService } from '../key/key.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { stringifyMessage } from '../message/models/message.model';
import { ChatGateway } from './chat.gateway';
import { ChatDTO, CreateChatDTO, CreateGroupChatDTO } from './dtos/chat.dto';
import { Chat, stringifyContacts, stringifyRead } from './models/chat.model';
import { ChatRedisRepository } from './repositories/chat-redis.repository';
import { BlockedContactService } from '../blocked-contact/blocked-contact.service';

@Injectable()
export class ChatService {
    constructor(
        private readonly _chatRepository: ChatRedisRepository,
        private readonly _configService: ConfigService,
        @Inject(forwardRef(() => ContactService))
        private readonly _contactService: ContactService,
        private readonly _messageService: MessageService,
        private readonly _apiService: ApiService,
        private readonly _keyService: KeyService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly _chatGateway: ChatGateway,
        @Inject(forwardRef(() => BlockedContactService))
        private readonly _blockedContactService: BlockedContactService
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
     * Creates a new group chat.
     * @param {CreateGroupChatDTO} createGroupChatDTO - Chat data to create.
     * @return {Chat} - Created entity.
     */
    async createGroupChat(createGroupChatDTO: CreateGroupChatDTO): Promise<Chat> {
        const userId = this._configService.get<string>('userId');
        console.log(JSON.stringify(createGroupChatDTO.contacts));
        try {
            const chat = await this.createChat(createGroupChatDTO);
            const msg = await this._messageService.createMessage(createGroupChatDTO.messages[0]);
            Promise.all(
                chat.parseContacts().map(async c => {
                    const isBlocked = await this._blockedContactService.isBlocked({ userId: c.id });
                    //todo: check if contact is accepted instead of blocked
                    if (isBlocked) return;
                    if (c.id === userId) {
                        this._chatGateway.emitMessageToConnectedClients('connection_request', {
                            ...chat.toJSON(),
                            messages: [msg.toJSON()],
                        });
                        return chat;
                    }
                    await this._apiService.sendGroupInvitation({ location: c.location, chat: { ...chat.toJSON() } });
                })
            );
            return chat;
        } catch (error) {
            throw new BadRequestException(`unable to create group chat: ${error}`);
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
        const ownId = this._configService.get<string>('userId');
        try {
            if (contact) {
                await this._contactService.updateContact({
                    id: contact.id,
                    contactRequest: false,
                    accepted: true,
                    containerOffline: false,
                });
                await this._apiService.acceptContactRequest({
                    ownId,
                    contactLocation: contact.location,
                });
            }
            chat.acceptedChat = true;
            await this._chatRepository.updateChat(chat);
            const messages = (await this._apiService.getAdminChat({ location: contact.location, chatId: ownId }))
                ?.messages;
            this._chatGateway.emitMessageToConnectedClients('new_chat', {
                ...chat.toJSON(),
                messages,
            });
            return chat.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to accept chat request: ${error}`);
        }
    }

    /**
     * Accepts a group chat request.
     * @param {ChatDTO} chat - Chat Id.
     * @return {ChatDTO} - Accepted chat.
     */
    async acceptGroupInvite(chat: CreateChatDTO): Promise<ChatDTO> {
        const existingChat = await this.getChat(chat.chatId);
        if (!existingChat) {
            const adminLocation = chat.contacts.find(c => c.id === chat.adminId).location;
            await this.syncNewChatWithAdmin({ adminLocation, chatId: chat.chatId });
        }
        this._chatGateway.emitMessageToConnectedClients('connection_request', chat);
        return chat;
    }

    /**
     * Gets chats using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 50.
     * @return {ChatDTO[]} - Found chats.
     */
    async getChats({ offset = 0, count = 50 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        try {
            const chats = await this._chatRepository.getChats({ offset, count });
            const chatDTOs = chats.map(c => c.toJSON());
            for (let i = 0; i < chatDTOs.length; i++) {
                const chatMessages = await this._messageService.getMessagesFromChat({
                    chatId: chatDTOs[i].chatId,
                    count,
                });
                chatDTOs[i].messages = chatMessages ?? [];
            }
            return chatDTOs;
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
     * Deletes a chat by its ID.
     * @param {string} chatId - Chat ID.
     */
    async deleteChat(chatId: string): Promise<void> {
        const chatToDelete = await this.getChat(chatId);
        if (chatToDelete)
            try {
                await this._messageService.deleteMessagesFromChat({ chatId });
                await this._chatRepository.deleteChat(chatToDelete.entityId);
                this._chatGateway.emitMessageToConnectedClients('chat_removed', chatToDelete.chatId);
            } catch (error) {
                return;
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
            await this._chatRepository.updateChat(chat);
            return chat;
        } catch (error) {
            throw new BadRequestException(`unable to remove contact from chat: ${error}`);
        }
    }

    /**
     * Adds a contact to a chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to add contact to.
     * @param {Contact} obj.contact - Contact to add.
     */
    async addContactToChat({ chat, contact }: { chat: Chat; contact: ContactDTO }) {
        try {
            const contacts = [
                ...chat.parseContacts(),
                {
                    id: contact.id,
                    location: contact.location,
                    roles: contact.roles,
                },
            ];
            chat.contacts = stringifyContacts(contacts);
            await this._chatRepository.updateChat(chat);
            return chat;
        } catch (error) {
            throw new BadRequestException(`unable to add contact to chat: ${error}`);
        }
    }

    /**
     * Updates a contact.
     */
    async updateContact({ chat, contact }: { chat: Chat; contact: ContactDTO }) {
        try {
            const contacts = chat.parseContacts();

            const index = contacts.findIndex(c => c.id === contact.id);
            if (index !== -1) contacts.splice(index, 1);

            const updatedContacts = [
                ...contacts,
                {
                    id: contact.id,
                    location: contact.location,
                    roles: contact.roles,
                },
            ];
            chat.contacts = stringifyContacts(updatedContacts);
            await this._chatRepository.updateChat(chat);
        } catch (error) {
            throw new BadRequestException(`unable to update contact: ${error}`);
        }
    }

    /**
     * Updates a chats draft message.
     * @param {Object} obj - Object.
     * @param {Chat} obj.draftMessage - Draft message to add to chat.
     * @return {ChatDTO} - Updated chat.
     *
     */
    async updateDraft({ draftMessage }: { draftMessage: MessageDTO<unknown> }): Promise<ChatDTO> {
        const chat = await this.getChat(draftMessage.chatId);
        chat.draft = stringifyMessage(draftMessage);
        try {
            await this._chatRepository.updateChat(chat);
            return chat.toJSON();
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    /**
     * Handles a message read.
     * @param {MessageDTO} message - Message that is read.
     */
    async handleMessageRead(message: MessageDTO<string>) {
        const chatId = this._messageService.determineChatID(message);
        const chat = await this.getChat(chatId);
        const read = chat.parseRead();
        const messages = await this._messageService.getAllMessagesFromChat({ chatId });
        console.log(`MESSAGE: ${JSON.stringify(message)}`);
        const newRead = messages.find(m => m.id === message.body);
        const oldReadIdx = read.findIndex(r => r.userId === message.from);
        const oldRead = messages.find(m => m.id === read[oldReadIdx]?.messageId);

        if (oldRead && newRead && newRead.timeStamp.getTime() < oldRead.timeStamp.getTime()) return;

        const newReadObj = { messageId: message.body, userId: message.from };
        if (oldReadIdx < 0) read.push(newReadObj);
        else read[oldReadIdx] = newReadObj;
        chat.read = stringifyRead(read);

        this._chatGateway.emitMessageToConnectedClients('message', message);
        await this._chatRepository.updateChat(chat);

        return chat;
    }

    /**
     * Get the group chat of the admin to sync it with new contacts in chat.
     * @param {Object} obj - Object.
     * @param {string} obj.adminLocation - External admin location to get chat from.
     * @param {string} obj.chatId - Chat ID to fetch from location.
     */
    async syncNewChatWithAdmin({ adminLocation, chatId }: { adminLocation: string; chatId: string }) {
        const chat = await this._apiService.getAdminChat({ location: adminLocation, chatId });
        Promise.all(
            chat.messages.map(async message => {
                await this._messageService.createMessage(message);
            })
        );
        this._chatGateway.emitMessageToConnectedClients('new_chat', chat);

        const existingChat = await this.getChat(chat.chatId);
        if (existingChat) {
            existingChat.contacts = stringifyContacts(chat.contacts);
            await this._chatRepository.updateChat(existingChat);
            return existingChat;
        }

        return await this.createChat(chat as CreateChatDTO);
    }

    /**
     * Send a message to all contacts of a group chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to send message to.
     * @param {MessageDTO} obj.message - Message to send.
     */
    async handleGroupAdmin({ chat, message }: { chat: Chat; message: MessageDTO<unknown> }) {
        // TODO: fix encryption
        // const validSignature = await this._messageService.verifySignedMessage({
        //     isGroup: false,
        //     adminContact: undefined,
        //     fromContact: chat.parseContacts().find(c => c.id === message.from),
        //     signedMessage: message,
        // });
        // console.log(`VALID SIGNATURE: ${validSignature}`);
        // if (!validSignature) throw new BadRequestException(`failed to verify message signature`);

        const signedMessage = await this._keyService.appendSignatureToMessage({ message });
        Promise.all(
            chat.parseContacts().map(async c => {
                if (c.id !== this._configService.get('userId'))
                    await this._apiService.sendMessageToApi({ location: c.location, message: signedMessage });
            })
        );
    }
}
