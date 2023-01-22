import { ConfigService } from '@nestjs/config';

import { GroupUpdate, ROLES, SystemMessage, UserLeftGroupMessage } from '../../../types/message-types';
import { ApiService } from '../../api/api.service';
import { ChatGateway } from '../../chat/chat.gateway';
import { ChatService } from '../../chat/chat.service';
import { ChatDTO } from '../../chat/dtos/chat.dto';
import { MessageDTO } from '../dtos/message.dto';
import { MessageService } from '../message.service';
import { Message } from '../models/message.model';
import { BlockedContactService } from '../../blocked-contact/blocked-contact.service';

export abstract class SubSystemMessageState {
    abstract handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat?: ChatDTO }): Promise<unknown>;
}

export class AddUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService,
        private readonly _blockedContactService: BlockedContactService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: ChatDTO }): Promise<unknown> {
        const { contact, adminLocation } = message.body as GroupUpdate;
        const userId = this._configService.get<string>('userId');
        //todo: check if contact is accepted instead of blocked
        const contactIsBlocked = await this._blockedContactService.isBlocked({ userId: contact.id });
        if (contactIsBlocked) return;

        if (userId === contact.id) {
            const adminChat = await this._chatService.syncNewChatWithAdmin({ adminLocation, chatId: message.to });
            await this._messageService.createMessage(message);
            this._chatGateway.emitMessageToConnectedClients('chat_updated', {
                ...adminChat.toJSON(),
                messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m =>
                    m.toJSON()
                ),
            });
            console.log('admin chat', adminChat.toJSON());
            return adminChat;
        }

        const chatToUpdate = await this._chatService.getChat(chat.chatId);
        const updatedChat = await this._chatService.addContactToChat({ chat: chatToUpdate, contact });
        if (updatedChat.isGroup) this._apiService.sendGroupInvitation({ location: contact.location, chat });
        await this._messageService.createMessage(message);

        this._chatGateway.emitMessageToConnectedClients('chat_updated', {
            ...updatedChat.toJSON(),
            messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m => m.toJSON()),
        });

        this._apiService.sendMessageToApi({ location: contact.location, message });
        return true;
    }
}

export class RemoveUserSystemState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: ChatDTO }) {
        const userId = this._configService.get<string>('userId');
        const { contact } = message.body as GroupUpdate;
        if (contact.id === userId) {
            const { chatId } = chat;
            await this._chatService.deleteChat(chatId);
            this._chatGateway.emitMessageToConnectedClients('chat_removed', chatId);
            return;
        }

        const chatToUpdate = await this._chatService.getChat(chat.chatId);
        const updatedChat = await this._chatService.removeContactFromChat({
            chat: chatToUpdate,
            contactId: contact.id,
        });
        await this._messageService.createMessage(message);

        this._chatGateway.emitMessageToConnectedClients('chat_updated', {
            ...updatedChat.toJSON(),
            messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m => m.toJSON()),
        });

        return true;
    }
}

export class ChangeUserRoleMessageState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _messageService: MessageService,
        private readonly _chatGateway: ChatGateway
    ) {}

    async handle({ message, chat }: { message: MessageDTO<GroupUpdate>; chat: ChatDTO }) {
        const contact = message.body.contact;
        const chatToUpdate = await this._chatService.getChat(chat.chatId);
        await this._chatService.updateContact({ chat: chatToUpdate, contact });
        await this._messageService.createMessage(message);
        await this._chatGateway.emitMessageToConnectedClients('chat_updated', {
            ...chatToUpdate.toJSON(),
            messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m => m.toJSON()),
        });
        return true;
    }
}

export class PersistSystemMessage implements SubSystemMessageState {
    constructor(private readonly _messageService: MessageService, private readonly _chatGateway: ChatGateway) {}

    async handle({ message }: { message: MessageDTO<SystemMessage>; chat: ChatDTO }): Promise<Message> {
        this._chatGateway.emitMessageToConnectedClients('message', message);
        return await this._messageService.createMessage(message);
    }
}

export class UserLeftGroupMessageState implements SubSystemMessageState {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _configService: ConfigService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {}

    async handle({ message, chat }: { message: MessageDTO<SystemMessage>; chat: ChatDTO }): Promise<void> {
        const userId = this._configService.get<string>('userId');
        const { contact, nextAdmin } = message.body as UserLeftGroupMessage;
        if (contact.id === userId) {
            await this._chatService.deleteChat(chat.chatId);
            this._chatGateway.emitMessageToConnectedClients('chat_removed', chat.chatId);
            return;
        }

        const chatToUpdate = await this._chatService.getChat(chat.chatId);
        const updatedChat = await this._chatService.removeContactFromChat({
            chat: chatToUpdate,
            contactId: contact.id,
        });
        await this._messageService.createMessage(message);

        const newAdmin = chat.contacts.find(c => c.id === nextAdmin);
        if (newAdmin) {
            updatedChat.adminId = newAdmin.id;
            newAdmin.roles = [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN];
            await this._chatService.updateContact({ chat: updatedChat, contact: newAdmin });
        }

        this._chatGateway.emitMessageToConnectedClients('chat_updated', {
            ...updatedChat.toJSON(),
            messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m => m.toJSON()),
        });
    }
}
