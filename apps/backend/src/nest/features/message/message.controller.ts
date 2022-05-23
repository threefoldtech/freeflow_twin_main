import { Body, Controller, ForbiddenException, Get, Param, Put, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MessageType } from '../../types/message-types';
import { ApiService } from '../api/api.service';
import { BlockedContactService } from '../blocked-contact/blocked-contact.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { ContactService } from '../contact/contact.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { MessageService } from './message.service';
import {
    ContactRequestMessageState,
    FileMessageState,
    MessageState,
    ReadMessageState,
    StringMessageState,
    SystemMessageState,
} from './states/message.state';

@Controller('messages')
export class MessageController {
    private _messageStateHandlers = new Map<MessageType, MessageState<unknown>>();

    constructor(
        private readonly _configService: ConfigService,
        private readonly _messageService: MessageService,
        private readonly _chatService: ChatService,
        private readonly _contactService: ContactService,
        private readonly _blockedContactService: BlockedContactService,
        private readonly _apiService: ApiService,
        private readonly _chatGateway: ChatGateway
    ) {
        // contact request handler
        this._messageStateHandlers.set(
            MessageType.CONTACT_REQUEST,
            new ContactRequestMessageState(this._messageService, this._contactService)
        );
        // read message handler
        this._messageStateHandlers.set(MessageType.READ, new ReadMessageState(this._chatService, this._chatGateway));
        // system message handler
        this._messageStateHandlers.set(
            MessageType.SYSTEM,
            new SystemMessageState(this._chatService, this._configService, this._apiService, this._chatGateway)
        );
        // string message handler
        this._messageStateHandlers.set(
            MessageType.STRING,
            new StringMessageState(this._chatService, this._chatGateway)
        );
        // GIF message handler
        this._messageStateHandlers.set(MessageType.GIF, new StringMessageState(this._chatService, this._chatGateway));
        // file message handler
        this._messageStateHandlers.set(MessageType.FILE, new FileMessageState(this._chatService, this._chatGateway));
    }

    @Put()
    async handleIncomingMessage(@Body() message: CreateMessageDTO<unknown>) {
        const blockedContacts = await this._blockedContactService.getBlockedContactList();
        const isBlocked = blockedContacts.find(c => c === message.from);

        if (isBlocked) throw new ForbiddenException('blocked');

        // needs to be checked first otherwise chat will always show as unaccepted
        if (message.type === MessageType.CONTACT_REQUEST)
            return await this._messageStateHandlers.get(MessageType.CONTACT_REQUEST).handle({ message, chat: null });

        const chatId = this._messageService.determineChatID(message);
        const chat = await this._chatService.getChat(chatId);

        if (message.type === MessageType.SYSTEM && chat.adminId !== message.from)
            throw new ForbiddenException(`not allowed`);

        const userId = this._configService.get<string>('userId');
        if (chat.isGroup && chat.adminId === userId) await this._chatService.handleGroupAdmin({ chat, message });

        return await this._messageStateHandlers.get(message.type).handle({ message, chat });
    }

    @Get(':chatId')
    async getChatMessages(
        @Param('chatId') chatId: string,
        @Query('from') from: string = null,
        @Query('page') page: number = null,
        @Query('limit') limit = 50
    ): Promise<{ hasMore: boolean; messages: MessageDTO<unknown>[] }> {
        limit = limit > 100 ? 100 : limit;

        return this._chatService.getChatMessages({ chatId, from, page, limit });
    }
}
