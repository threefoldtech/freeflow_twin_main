import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { StatusUpdate } from 'custom-types';
import { Server } from 'socket.io';

import { ApiService } from '../api/api.service';
import { ChatService } from '../chat/chat.service';
import { ContactService } from '../contact/contact.service';
import { Contact } from '../contact/models/contact.model';

@WebSocketGateway({ cors: '*' })
export class UserGateway implements OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('UserGateway');

    private contacts: Contact[];

    constructor(
        private readonly _contactService: ContactService,
        private readonly _apiService: ApiService,
        private readonly _configService: ConfigService,
        private readonly _chatService: ChatService
    ) {}

    @SubscribeMessage('remove_user')
    async handleRemoveUserFromConnections(@MessageBody() chatId: string) {
        await this._contactService.deleteContact({ id: chatId });
        await this._chatService.deleteChat(chatId);
        this.emitMessageToConnectedClients('chat_removed', chatId);
    }

    /**
     * Handles socket initialization.
     * @param {Server} server - socket.io server.
     */
    async afterInit(server: Server) {
        this.logger.log(`user gateway setup successful`);
        this.server = server;
    }

    /**
     * Returns the connecten sockets length.
     */
    async getConnections(): Promise<number> {
        const sockets = await this.server.allSockets();
        return sockets.size;
    }

    /**
     * Handles a new socket.io client connection.
     */
    async handleConnection() {
        this.contacts = await this._contactService.getContacts();
        const status: StatusUpdate = {
            id: this._configService.get<string>('userId'),
            isOnline: true,
        };
        this.handleStatusEmit({ status });
    }

    /**
     * Handles a socket.io client disconnection.
     */
    async handleDisconnect() {
        this.contacts = await this._contactService.getContacts();
        const status: StatusUpdate = {
            id: this._configService.get<string>('userId'),
            isOnline: false,
        };
        this.handleStatusEmit({ status });
    }

    private async handleStatusEmit({ status }: { status: StatusUpdate }) {
        Promise.all(
            this.contacts.map(async c => {
                await this._apiService.sendStatusUpdate({ location: c.location, status });
            })
        );
    }

    /**
     * Emits message to connected clients.
     * @param {string} event - Event to emit.
     * @param {unknown} message - Message to send.
     */
    emitMessageToConnectedClients(event: string, message: unknown): void {
        this.server.emit(event, message);
    }
}
