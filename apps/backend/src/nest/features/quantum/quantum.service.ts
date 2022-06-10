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
import { Share, stringifyOwner, stringifyPermissions } from './models/share.model';
import { ShareRedisRepository } from './repositories/share-redis.repository';

@Injectable()
export class QuantumService {
    private userId: string;

    constructor(
        private readonly _shareRepository: ShareRedisRepository,
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

    /**
     * Shares a file with a contact.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the file.
     * @param {boolean} obj.isPublic - Public share.
     * @param {boolean} obj.isWritable - Whether the share is writtable.
     * @param {string} obj.userId - User Id to share file with.
     * @param {string} obj.filename - Share filename.
     */
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

        const creationData = {
            path,
            owner: me,
            name: filename,
            isFolder: pathStats.isDirectory(),
            isSharedWithMe: false,
            permissions: sharePermissions,
            size: pathStats.size,
            lastModified: pathStats.mtime.getTime(),
        };

        let share;
        const existingShare = await this._shareRepository.getShareByPath({ path });
        if (existingShare?.id) share = await this.updateShare(existingShare, { ...creationData });
        else share = await this.createFileShare(creationData);

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

        const contacts = chat.parseContacts().filter(c => c.id !== this.userId);

        for (const contact of contacts) {
            const permission = existingShare?.parsePermissions().find(p => p.userId === contact.id);
            if (permission?.sharePermissionTypes.length === sharePermissionTypes.length) continue;
            this._apiService.sendMessageToApi({ location: contact.location, message: signedMsg });
        }

        this._chatGateway.emitMessageToConnectedClients('message', signedMsg);

        return true;
    }

    /**
     * Get shares that have been shared with the user.
     * @return {IFileShare[]} - File shares.
     */
    async getSharedWithMe(): Promise<IFileShare[]> {
        try {
            return (await this._shareRepository.getSharedWithMe()).map(s => s.toJSON());
        } catch {
            return [];
        }
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

    /**
     * Creates a new file share.
     * @param {CreateFileShareDTO} dto - Creation object.
     * @return {IFileShare} - File share.
     */
    private async createFileShare({
        id,
        path,
        owner,
        name,
        isFolder,
        isSharedWithMe,
        permissions,
        size,
        lastModified,
    }: CreateFileShareDTO): Promise<IFileShare> {
        if (!id) id = uuidv4();

        try {
            return (
                await this._shareRepository.createShare({
                    id,
                    path,
                    owner,
                    name,
                    isFolder,
                    isSharedWithMe,
                    size,
                    lastModified,
                    permissions,
                })
            ).toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to save file share to database: ${error}`);
        }
    }

    /**
     * Updates an existing file share.
     * @param {Share} existingShare - Share to update.
     * @param {CreateFileShareDTO} dto - Creation object.
     * @return {IFileShare} - Updated file share.
     */
    private async updateShare(
        existingShare: Share,
        { path, owner, name, isFolder, isSharedWithMe, permissions, size, lastModified }: CreateFileShareDTO
    ): Promise<IFileShare> {
        existingShare.path = path;
        existingShare.owner = stringifyOwner(owner);
        existingShare.name = name;
        existingShare.isFolder = isFolder;
        existingShare.isSharedWithMe = isSharedWithMe;
        existingShare.permissions = stringifyPermissions(permissions);
        existingShare.size = size;
        existingShare.lastModified = lastModified;
        return (await this._shareRepository.updateShare({ share: existingShare })).toJSON();
    }
}
