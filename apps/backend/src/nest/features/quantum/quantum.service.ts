import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { IFileShareMessage, MessageType } from '../../types/message-types';
import { uuidv4 } from '../../utils/uuid';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { FileService } from '../file/file.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { RenameFileDTO } from './dtos/rename-file.dto';
import { CreateFileShareDTO, ShareFileRequesDTO } from './dtos/share-file.dto';
import { SharePermissionType } from './enums/share-permission-type.enum';
import { IFileShare } from './interfaces/file-share.interface';
import { ISharePermission } from './interfaces/share-permission.interface';

@Injectable()
export class QuantumService {
    private userId: string;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _messageService: MessageService,
        private readonly _fileService: FileService,
        private readonly _locationService: LocationService,
        private readonly _keyService: KeyService,
        private readonly _apiService: ApiService,
        private readonly _chatService: ChatService,
        private readonly _chatGateway: ChatGateway
    ) {
        this.userId = this._configService.get<string>('userId');
    }

    /**
     * Get the contents of a directory by given path.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async getDirectoryContent({ path }: { path: string }): Promise<PathInfoDTO[]> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isDirectory()) throw new BadRequestException('path is not a directory');
            const contents = await this._fileService.readDirectory({
                path,
                options: { withFileTypes: true },
            });

            return Promise.all(
                contents.map(async file => {
                    if (file.isBlockDevice() || file.isCharacterDevice() || file.isSymbolicLink() || file.isSocket())
                        return;
                    return await this.formatFileDetails({ path: join(path, file.name) });
                })
            );
        } catch (error) {
            throw new BadRequestException(`unable to get directory content: ${error}`);
        }
    }

    /**
     * Get directory stats.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async getDirectoryInfo({ path }: { path: string }): Promise<PathInfoDTO> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isDirectory()) throw new BadRequestException('path is not a directory');

            return await this.formatFileDetails({ path });
        } catch (error) {
            throw new BadRequestException(`unable to get directory info: ${error}`);
        }
    }

    /**
     * Creates a directory.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO} - PathInfoDTO.
     */
    async createDirectoryWithRetry({ path, count = 0 }: { path: string; count?: number }): Promise<PathInfoDTO> {
        const pathWithCount = count === 0 ? path : `${path} (${count})`;
        if (this._fileService.exists({ path: pathWithCount }))
            return await this.createDirectoryWithRetry({ path, count: count + 1 });

        this._fileService.makeDirectory({ path: pathWithCount });
        return await this.formatFileDetails({ path: pathWithCount });
    }

    /**
     * Creates a file.
     * @param {Object} obj - Object.
     * @param {string} obj.fromPath - From path.
     * @param {string} obj.toPath - To path.
     * @param {string} obj.name - Name.
     */
    createFileWithRetry({
        fromPath,
        toPath,
        name,
        count = 0,
    }: {
        fromPath: string;
        toPath: string;
        name: string;
        count?: number;
    }): void {
        const path = join(toPath, name);
        const pathWithCount = count === 0 ? path : `${path.insert(path.lastIndexOf('.'), ` (${count})`)}`;
        if (this._fileService.exists({ path: pathWithCount }))
            return this.createFileWithRetry({ fromPath, toPath, name, count: count + 1 });

        this._fileService.moveFile({ from: fromPath, to: pathWithCount });
    }

    /**
     * Renames a file or directory.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to rename from.
     * @param {string} obj.to - Path to rename to.
     */
    async renameFileOrDirectory({ from, to }: RenameFileDTO): Promise<void> {
        // TODO: handle shares
        if (!this._fileService.exists({ path: from }))
            throw new BadRequestException('unable to rename file, file does not exist');
        if (this._fileService.exists({ path: to }))
            throw new BadRequestException('unable to rename file, file with that name already exists');

        return await this._fileService.rename({ from, to });
    }

    /**
     * Search in folder and subfolders.
     * @param {Object} obj - Object.
     * @param {string} obj.search - Search term.
     * @param {string} obj.dir - Path to the directory.
     * @return {PathInfoDTO[]} - PathInfoDTO[].
     */
    async search({
        search,
        dir,
        files = [],
    }: {
        search: string;
        dir: string;
        files?: PathInfoDTO[];
    }): Promise<PathInfoDTO[]> {
        const contents = await this.getDirectoryContent({ path: dir });
        for (const file of contents) {
            files.push(file);
            const stats = await this._fileService.getStats({ path: join(dir, file.fullName) });
            if (stats.isDirectory()) files = await this.search({ search, dir: join(dir, file.fullName), files });
        }
        return files.filter(content => content.fullName.toLowerCase().includes(search.toLowerCase()));
    }

    async shareFile({ path, isPublic, isWritable, userId: shareWith, filename }: ShareFileRequesDTO): Promise<boolean> {
        if (isWritable && isPublic) throw new BadRequestException('cannot share file as public and writable');

        const chat = await this._chatService.getChat(shareWith);

        const sharePermissionTypes = [SharePermissionType.READ];
        if (isWritable) sharePermissionTypes.push(SharePermissionType.WRITE);
        const sharePermissions: ISharePermission[] = [{ userId: shareWith, sharePermissionTypes }];

        const pathStats = await this._fileService.getStats({ path });

        const myLocation = await this._locationService.getOwnLocation();
        const me = {
            id: this.userId,
            location: myLocation as string,
        };
        const share = await this.createFileShare({
            path,
            owner: me,
            name: filename,
            isFolder: pathStats.isDirectory(),
            permissions: sharePermissions,
            size: pathStats.size,
            lastModified: pathStats.mtime.getTime(),
        });

        const msg: MessageDTO<IFileShareMessage> = {
            id: uuidv4(),
            chatId: chat.chatId,
            from: this.userId,
            to: shareWith,
            body: share,
            timeStamp: new Date(),
            type: MessageType.FILE_SHARE,
            subject: null,
            signatures: [],
            replies: [],
        };
        const signedMsg = await this._keyService.appendSignatureToMessage({ message: msg });
        await this._messageService.createMessage(signedMsg);

        chat.parseContacts()
            .filter(c => c.id !== this.userId)
            .forEach(contact => {
                // TODO: check existing share permissions
                this._apiService.sendMessageToApi({ location: contact.location, message: signedMsg });
            });

        this._chatGateway.emitMessageToConnectedClients('message', signedMsg);

        return true;
    }

    /**
     * Formats the file details to be returned to the client.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the file.
     * @return {PathInfoDTO} - PathInfoDTO.
     */
    private async formatFileDetails({ path }: { path: string }): Promise<PathInfoDTO> {
        try {
            const stats = await this._fileService.getStats({ path });
            const details = this._fileService.getPathDetails({ path });
            const extension = details.ext.replace(/\./g, '');
            const directory = details.dir;

            return {
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                directory,
                path,
                fullName: details.base,
                name: details.name,
                extension,
                size: stats.size,
                createdOn: stats.ctime,
                lastModified: stats.mtime,
                lastAccessed: stats.atime,
            };
        } catch (error) {
            throw new BadRequestException(`unable to get file details: ${error}`);
        }
    }

    private async createFileShare({
        id,
        path,
        owner,
        name,
        isFolder,
        permissions,
        size,
        lastModified,
    }: CreateFileShareDTO): Promise<IFileShare> {
        // TODO: handle existing share
        // TODO: persist share in db
        if (!id) id = uuidv4();
        return {
            id,
            path,
            owner,
            name,
            isFolder,
            permissions,
            size,
            lastModified,
        };
    }
}
