import { ConfigService } from '@nestjs/config';
import { IAvatarFile, IChatFile, IPostFile, IQuantumFile } from 'custom-types/file-actions.type';
import { join } from 'path';

import { FileMessage, MessageType } from '../../types/message-types';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { QuantumService } from '../quantum/quantum.service';
import { FileService } from './file.service';
import { uuidv4 } from '../../utils/uuid';

export enum FileAction {
    ADD_TO_CHAT = 'ADD_TO_CHAT',
    ADD_TO_POST = 'ADD_TO_POST',
    ADD_TO_QUANTUM = 'ADD_TO_QUANTUM',
    CHANGE_AVATAR = 'CHANGE_AVATAR',
}

export abstract class FileState<T> {
    abstract handle({ fileId, payload }: { fileId: string; payload: T }): Promise<boolean>;
}

export class ChatFileState implements FileState<IChatFile> {
    private storageDir = '';

    constructor(
        private readonly _configService: ConfigService,
        private readonly _fileService: FileService,
        private readonly _apiService: ApiService,
        private readonly _locationService: LocationService,
        private readonly _keyService: KeyService,
        private readonly _chatService: ChatService,
        private readonly _chatGateway: ChatGateway,
        private readonly _messageService: MessageService
    ) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    async handle({ fileId, payload }: { fileId: string; payload: IChatFile }) {
        const { chatId, messageId, type, filename } = payload;
        const fromPath = `tmp/${fileId}`;
        const userId = this._configService.get<string>('userId');
        const path = `${this.storageDir}/${userId}/chats`;

        try {
            this._fileService.makeDirectory({ path });
            this._fileService.moveFile({ from: fromPath, to: join(path, filename) });
        } catch (error) {
            return false;
        }
        // create new message and emit to connected sockets
        const yggdrasilAddress = await this._locationService.getOwnLocation();
        const chatPath = `${userId}/chats/${filename}`;
        const destinationUrl = `http://[${yggdrasilAddress}]/api/v2/files/${btoa(chatPath)}`;
        const message: MessageDTO<FileMessage> = {
            id: messageId,
            chatId,
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
        await this._messageService.createMessage(message);

        const chat = await this._chatService.getChat(chatId);
        const signedMessage = await this._keyService.appendSignatureToMessage({ message });

        if (chat.isGroup) {
            await this._apiService.sendMessageToGroup({ contacts: chat.parseContacts(), message: signedMessage });
            return true;
        }

        const location = chat.parseContacts().find(c => c.id === message.to).location;
        await this._apiService.sendMessageToApi({ location, message: <MessageDTO<string>>signedMessage });
        return true;
    }
}

export class PostFileState implements FileState<IPostFile> {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _fileService: FileService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    async handle({ fileId, payload }: { fileId: string; payload: IPostFile }) {
        const { filename } = payload;
        const fromPath = `tmp/${fileId}`;
        const userId = this._configService.get('userId');
        const path = `${this.storageDir}/${userId}/posts`;

        try {
            this._fileService.makeDirectory({ path });
            this._fileService.moveFile({ from: fromPath, to: join(path, filename) });
        } catch (error) {
            return false;
        }

        return true;
    }
}

export class AvatarFileState implements FileState<IAvatarFile> {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _fileService: FileService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}user`;
    }

    async handle({ fileId, payload }: { fileId: string; payload: IAvatarFile }) {
        const { filename } = payload;
        const fromPath = `tmp/${fileId}`;

        try {
            this._fileService.moveFile({ from: fromPath, to: join(this.storageDir, filename) });
        } catch (error) {
            return false;
        }
        return true;
    }
}

export class QuantumFileState implements FileState<IQuantumFile> {
    private storageDir = '';

    constructor(
        private readonly _configService: ConfigService,
        private readonly _fileService: FileService,
        private readonly _quantumService: QuantumService
    ) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    async handle({ fileId, payload }: { fileId: string; payload: IQuantumFile }) {
        const { filename: name, path } = payload;
        const fromPath = `tmp/${fileId}`;
        const toPath = path === '/' ? this.storageDir : path;

        try {
            this._fileService.makeDirectory({ path: toPath });
            this._quantumService.createFileWithRetry({ fromPath, toPath, name });
        } catch (error) {
            return false;
        }

        return true;
    }
}
