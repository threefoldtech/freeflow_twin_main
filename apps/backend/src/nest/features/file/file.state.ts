import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ChatFile } from 'types/file-actions.type';

import { FileMessage, MessageType } from '../../types/message-types';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { FileService } from './file.service';

export enum FileAction {
    ADD_TO_CHAT = 'ADD_TO_CHAT',
    CHANGE_AVATAR = 'CHANGE_AVATAR',
}

export abstract class FileState<T> {
    abstract handle({ fileId, payload }: { fileId: string; payload: T }): Promise<boolean>;
}

export class ChatFileState implements FileState<ChatFile> {
    private storageDir = '';

    constructor(
        private readonly _configService: ConfigService,
        private readonly _fileService: FileService,
        private readonly _apiService: ApiService,
        private readonly _locationService: LocationService,
        private readonly _keyService: KeyService,
        private readonly _chatService: ChatService,
        private readonly _chatGateway: ChatGateway
    ) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    async handle({ fileId, payload }: { fileId: string; payload: ChatFile }) {
        const { chatId, messageId, type, filename } = payload;
        const fromPath = `tmp/${fileId}`;

        try {
            this._fileService.makeDirectory({ path: this.storageDir });
            this._fileService.moveFile({ from: fromPath, to: join(this.storageDir, fileId) });
        } catch (error) {
            console.error(error);
            return false;
        }
        // create new message and emit to connected sockets
        const yggdrasilAddress = await this._locationService.getOwnLocation();
        const destinationUrl = `http://[${yggdrasilAddress}]/api/v2/files/${fileId}`;
        const message: MessageDTO<FileMessage> = {
            id: messageId,
            from: this._configService.get<string>('userId'),
            to: chatId,
            body: {
                type,
                filename,
                url: destinationUrl,
            },
            timeStamp: new Date(),
            type: MessageType.FILE,
            subject: null,
            signatures: [],
            replies: [],
        };
        this._chatGateway.emitMessageToConnectedClients('message', message);
        const chat = await this._chatService.getChat(chatId);
        const signedMessage = await this._keyService.appendSignatureToMessage({ message });
        const location = chat.parseContacts().find(c => c.id === message.to).location;
        await this._chatService.addMessageToChat({ chat, message });
        await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
        return true;
    }
}
