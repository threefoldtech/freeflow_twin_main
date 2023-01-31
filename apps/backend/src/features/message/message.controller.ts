import { Body, Controller, ForbiddenException, Get, Param, Put, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MessageType } from '../../types/message-types';
import { ApiService } from '../api/api.service';
import { BlockedContactService } from '../blocked-contact/blocked-contact.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { ContactService } from '../contact/contact.service';
import { QuantumService } from '../quantum/quantum.service';
import { MessageDTO } from './dtos/message.dto';
import { MessageService } from './message.service';
import {
    ContactRequestMessageState,
    DeleteMessageState,
    EditMessageState,
    FileMessageState,
    FileShareMessageState,
    MessageState,
    PostShareMessageState,
    ReadMessageState,
    RenameFileShareMessageState,
    StringMessageState,
    SystemMessageState,
} from './states/message.state';
import { UserGateway } from '../user/user.gateway';
import { FirebaseService } from '../firebase/firebase.service';

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
        private readonly _chatGateway: ChatGateway,
        private readonly _userGateway: UserGateway,
        private readonly _firebaseService: FirebaseService,
        private readonly _quantumService: QuantumService
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
            new SystemMessageState(
                this._chatService,
                this._configService,
                this._apiService,
                this._chatGateway,
                this._messageService,
                this._blockedContactService
            )
        );
        // string message handler
        this._messageStateHandlers.set(
            MessageType.STRING,
            new StringMessageState(this._chatGateway, this._messageService)
        );
        // Reply message handler
        this._messageStateHandlers.set(
            MessageType.QUOTE,
            new StringMessageState(this._chatGateway, this._messageService)
        );
        // GIF message handler
        this._messageStateHandlers.set(
            MessageType.GIF,
            new StringMessageState(this._chatGateway, this._messageService)
        );
        // file message handler
        this._messageStateHandlers.set(MessageType.FILE, new FileMessageState(this._chatGateway, this._messageService));
        // file share message handler
        this._messageStateHandlers.set(
            MessageType.FILE_SHARE,
            new FileShareMessageState(
                this._chatGateway,
                this._messageService,
                this._configService,
                this._quantumService
            )
        );
        // rename file share message handler
        this._messageStateHandlers.set(
            MessageType.FILE_SHARE_UPDATE,
            new RenameFileShareMessageState(this._chatGateway, this._messageService, this._quantumService)
        );
        // edit message handler
        this._messageStateHandlers.set(MessageType.EDIT, new EditMessageState(this._chatGateway, this._messageService));
        // Delete message handler
        this._messageStateHandlers.set(
            MessageType.DELETE,
            new DeleteMessageState(this._chatGateway, this._messageService)
        );
        //post share handler
        this._messageStateHandlers.set(
            MessageType.POST_SHARE,
            new PostShareMessageState(this._chatGateway, this._messageService)
        );
    }

    @Put()
    async handleIncomingMessage(@Body() message: MessageDTO<unknown>) {
        const blockedContacts = await this._blockedContactService.getBlockedContactIds();
        const isBlocked = blockedContacts.find(c => c === message.from);

        if (isBlocked) throw new ForbiddenException('blocked');

        // needs to be checked first otherwise chat will always show as unaccepted
        if (message.type === MessageType.CONTACT_REQUEST)
            return await this._messageStateHandlers.get(MessageType.CONTACT_REQUEST).handle({ message });

        const chatId = this._messageService.determineChatID(message);
        const chat = await this._chatService.getChat(chatId);

        if (!chat) return;

        message.chatId = chatId;

        const userId = this._configService.get<string>('userId');
        if (chat.isGroup && chat.adminId === userId) this._chatService.handleGroupAdmin({ chat, message });

        // Check if the message is still unread after 5 seconds => call notify function
        setTimeout(async () => {
            await this._messageService.notifyIfUnread(message, chatId);
        }, 5000);

        return await this._messageStateHandlers.get(message.type).handle({ message, chat });
    }

    @Get('/:chatId')
    async getMessages(@Param('chatId') chatId: string, @Query() query: { totalMessagesLoaded: string; limit: string }) {
        const { totalMessagesLoaded, limit } = query;
        const chatMessages = await this._messageService.getMessagesFromChat({
            chatId,
            count: parseInt(limit),
            totalMessagesLoaded: parseInt(totalMessagesLoaded),
        });
        return { messages: chatMessages, hasMore: chatMessages.length === parseInt(limit) };
    }
}
