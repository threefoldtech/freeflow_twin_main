import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { QuantumService } from '../quantum/quantum.service';
import { FileService } from './file.service';
import { AvatarFileState, ChatFileState, FileAction, FileState, PostFileState, QuantumFileState } from './file.state';
import { MessageService } from '../message/message.service';

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
        private readonly _chatGateway: ChatGateway,
        private readonly _quantumService: QuantumService,
        private readonly _messageService: MessageService
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
                this._chatGateway,
                this._messageService
            )
        );

        // handles files for a post
        this._fileStateHandlers.set(FileAction.ADD_TO_POST, new PostFileState(this._configService, this._fileService));
        //
        // handles files for quantum
        this._fileStateHandlers.set(
            FileAction.ADD_TO_QUANTUM,
            new QuantumFileState(this._configService, this._fileService, this._quantumService)
        );
        // handles files for avatar
        this._fileStateHandlers.set(
            FileAction.CHANGE_AVATAR,
            new AvatarFileState(this._configService, this._fileService)
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
