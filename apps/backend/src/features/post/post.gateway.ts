import { Logger } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: '*' })
export class PostGateway implements OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('ChatGateway');

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
}
