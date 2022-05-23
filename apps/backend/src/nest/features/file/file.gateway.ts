import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { FileService } from './file.service';
import { ChatFileState, FileAction, FileState } from './file.state';

@WebSocketGateway({ cors: '*' })
export class FileGateway implements OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private logger: Logger = new Logger('FileGateway');

    private _fileStateHandlers = new Map<FileAction, FileState<unknown>>();

    constructor(
        private readonly _configService: ConfigService,
        private readonly _fileService: FileService,
        private readonly _apiService: ApiService,
        private readonly _locationService: LocationService,
        private readonly _keyService: KeyService,
        private readonly _chatService: ChatService,
        private readonly _chatGateway: ChatGateway
    ) {
        // handles files being sent in chat
        this._fileStateHandlers.set(
            FileAction.ADD_TO_CHAT,
            new ChatFileState(
                this._configService,
                this._fileService,
                this._apiService,
                this._locationService,
                this._keyService,
                this._chatService,
                this._chatGateway
            )
        );
    }

    afterInit(server: Server) {
        this.logger.log(`file gateway setup successful`);
        this.server = server;
    }

    @SubscribeMessage('handle_uploaded_file')
    async handleUploadedFile(
        @MessageBody() { fileId, payload, action }: { fileId: string; payload: unknown; action: FileAction }
    ) {
        return await this._fileStateHandlers.get(action).handle({ fileId, payload });
    }
}
