import { forwardRef, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { MessageType } from '../../types/message-types';
import { ApiService } from '../api/api.service';
import { BlockedContactService } from '../blocked-contact/blocked-contact.service';
import { KeyService } from '../key/key.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { Message } from '../message/models/message.model';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('ChatGateway');

    private userId: string;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _blockedContactService: BlockedContactService,
        private readonly _apiService: ApiService,
        private readonly _messageService: MessageService,
        @Inject(forwardRef(() => ChatService))
        private readonly _chatService: ChatService
    ) {
        this.userId = this._configService.get<string>('userId');
    }

    /**
     * Sends a new incoming message to all connected clients.
     */
    @SubscribeMessage('message')
    async handleIncomingMessage(@MessageBody() { message }: { chatId: string; message: Message }) {
        console.log(`MSG TYPE SENT: ${message.type}`);
        // get chat data
        const chat = await this._chatService.getChat(message.to);
        if (!chat) return;
        // correct from to message
        message.from = this.userId;

        // sign message
        const signedMessage = await this._keyService.appendSignatureToMessage({ message });

        // set correct chatId to message
        signedMessage.id = message.id;
        signedMessage.chatId = message.chatId;

        const location = chat.parseContacts().find(c => c.id === chat.adminId).location;
        if (signedMessage.type === MessageType.READ) {
            await this._chatService.handleMessageRead(<MessageDTO<string>>signedMessage);
            return await this._apiService.sendMessageToApi({
                location,
                message: <MessageDTO<string>>signedMessage,
            });
        }

        // persist message
        await this._messageService.createMessage(signedMessage);

        return await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
    }

    @SubscribeMessage('update_message')
    async handleUpdateMessage(@MessageBody() { message }: { message: MessageDTO<string> }) {
        // TODO: handle edit/delete message
        console.log(`UPDATE MSG TYPE: ${JSON.stringify(message)}`);
        const chat = await this._chatService.getChat(message.to);
        if (!chat) return;

        message.from = this._configService.get<string>('userId');
        const editedMessage = await this._messageService.editMessage({
            messageId: message.id,
            text: JSON.stringify(message.body),
        });
        editedMessage.type = message.type;

        this.emitMessageToConnectedClients('message', editedMessage);
        const signedMessage = await this._keyService.appendSignatureToMessage({ message: editedMessage });

        chat.parseContacts()
            .filter(c => c.id !== this.userId)
            .map(async c => {
                return await this._apiService.sendMessageToApi({
                    location: c.location,
                    message: signedMessage,
                });
            });

        if (message.type === MessageType.DELETE) {
            await this._messageService.deleteMessage({ messageId: message.id });
        }
    }

    @SubscribeMessage('block_chat')
    async handleBlockChat(@MessageBody() id: string) {
        await this._blockedContactService.addBlockedContact({ id });
        this.emitMessageToConnectedClients('chat_blocked', id);
    }

    @SubscribeMessage('unblock_chat')
    async handleUnBlockChat(@MessageBody() id: string) {
        await this._blockedContactService.deleteBlockedContact({ id });
        this.emitMessageToConnectedClients('chat_unblocked', id);
    }

    @SubscribeMessage('remove_chat')
    async handleRemoveChat(@MessageBody() id: string) {
        const chat = await this._chatService.getChat(id);
        // only admin can delete group chat for everyone
        if (chat.isGroup && chat.adminId === this.userId) {
            const contacts = chat.parseContacts().filter(c => c.id !== this.userId);
            contacts.map(async c => {
                await this._apiService.sendRemoveChat({ location: c.location, chatId: id });
            });
        }
        await this._chatService.deleteChat(id);

        this.emitMessageToConnectedClients('chat_removed', id);
    }

    /**
     * Emits message to connected clients.
     * @param {string} event - Event to emit.
     * @param {unknown} message - Message to send.
     */
    emitMessageToConnectedClients(event: string, message: unknown): void {
        this.server.emit(event, message);
    }

    /**
     * Handles socket initialization.
     * @param {Server} server - socket.io server.
     */
    afterInit(server: Server) {
        this.logger.log(`chat gateway setup successful`);
        this.server = server;
    }

    /**
     * Handles a new socket.io client connection.
     * @param {Socket} client - socket.io client.
     */
    handleConnection(client: Socket): void {
        this.logger.log(`new client connection: ${client.id}`);
    }

    /**
     * Handles a socket.io client disconnection.
     * @param {Socket} client - socket.io client.
     */
    handleDisconnect(client: Socket): void {
        this.logger.log(`client disconnected: ${client.id}`);
    }
}
