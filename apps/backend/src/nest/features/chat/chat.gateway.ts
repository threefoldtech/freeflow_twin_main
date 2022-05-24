import { ForbiddenException, forwardRef, Inject, Logger } from '@nestjs/common';
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

    private userId: string;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _blockedContactService: BlockedContactService,
        private readonly _apiService: ApiService,
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
        // get chat data
        const chat = await this._chatService.getChat(message.to);
        if (!chat) return;
        // correct from to message
        message.from = this._configService.get<string>('userId');

        // sign message
        const signedMessage = await this._keyService.appendSignatureToMessage({ message });

        // set correct chatId to message
        signedMessage.id = message.id;

        const location = chat.parseContacts().find(c => c.id === chat.adminId).location;
        if (signedMessage.type === MessageType.READ) {
            await this._chatService.handleMessageRead(<MessageDTO<string>>signedMessage);
            return await this._apiService.sendMessageToApi({
                location,
                message: <MessageDTO<string>>signedMessage,
            });
        }

        // persist message
        this._chatService.addMessageToChat({ chat, message: signedMessage });

        return await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
    }

    @SubscribeMessage('update_message')
    async handleUpdateMessage(@MessageBody() { message }: { message: Message }) {
        console.log(`UPDATE MSG TYPE: ${JSON.stringify(message)}`);
        // const chat = await this._chatService.getChat(message.to);
        // if (!chat) return;

        // message.from = this._configService.get<string>('userId');
        // // await this._chatService.handleEditMessage({ chatId: message.chatId, message });

        // const signedMessage = await this._keyService.appendSignatureToMessage({ message });
        // this._chatService.addMessageToChat({ chat, message: signedMessage });

        // const location = chat.parseContacts().find(c => c.id === chat.adminId).location;
        // return await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
    }

    @SubscribeMessage('block_chat')
    async handleBlockChat(@MessageBody() id: string) {
        await this._blockedContactService.addBlockedContact({ id });
        this.emitMessageToConnectedClients('chat_blocked', id);
    }

    @SubscribeMessage('remove_chat')
    async handleRemoveCHat(@MessageBody() id: string) {
        const chat = await this._chatService.getChat(id);
        if (chat.adminId !== this.userId) throw new ForbiddenException('not chat admin');
        const contacts = chat.parseContacts().filter(c => c.id !== this.userId);
        contacts.map(async c => {
            await this._apiService.sendRemoveChat({ location: c.location, chatId: id });
        });
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
