import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ApiService } from '../api/api.service';

@WebSocketGateway({ cors: '*' })
export class ContactGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('ChatGateway');

    private userId: string;

    constructor(private readonly _configService: ConfigService, private readonly _apiService: ApiService) {
        this.userId = this._configService.get<string>('userId');
    }

    /**
     * Emits data to connected clients.
     * @param {string} event - Event to emit.
     * @param {unknown} data - Data to send.
     */
    emitToConnectedClients(event: string, data: unknown): void {
        this.server.emit(event, data);
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
