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
import { Message } from '../message/models/message.model';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: '*' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('ChatGateway');

    constructor(
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _blockedContactService: BlockedContactService,
        private readonly _apiService: ApiService,
        @Inject(forwardRef(() => ChatService))
        private readonly _chatService: ChatService
    ) {}

    /**
     * Sends a new incoming message to all connected clients.
     */
    @SubscribeMessage('message')
    async handleIncomingMessage(@MessageBody() { message }: { chatId: string; message: Message }) {
        // get chat data
        const chat = await this._chatService.getChat(message.to);
        if (!chat) return;
        // correct from to message
        message.from = this._configService.get<string>('userId');

        // sign message
        const signedMessage = await this._keyService.appendSignatureToMessage({ message });

        // set correct chatId to message
        signedMessage.id = message.id;

        const contacts = chat.parseContacts();
        const location = contacts.find(c => c.id === message.to).location;
        if (signedMessage.type === MessageType.READ) {
            return await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
        }

        // persist message
        this._chatService.addMessageToChat({ chat, message: signedMessage });

        return await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
    }

    @SubscribeMessage('block_chat')
    async handleBlockChat(@MessageBody() id: string) {
        await this._blockedContactService.addBlockedContact({ id });
        this.emitMessageToConnectedClients('chat_blocked', id);
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
