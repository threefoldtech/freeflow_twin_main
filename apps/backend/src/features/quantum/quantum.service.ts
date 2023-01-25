import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { join } from 'path';

import { IFileShareMessage, MessageType } from '../../types/message-types';
import { uuidv4 } from '../../utils/uuid';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { ContactService } from '../contact/contact.service';
import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { FileService } from '../file/file.service';
import { KeyService } from '../key/key.service';
import { KeyType } from '../key/models/key.model';
import { LocationService } from '../location/location.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { RenameFileDTO } from './dtos/rename-file.dto';
import { CreateFileShareDTO, ShareFileRequesDTO } from './dtos/share-file.dto';
import { SharePermissionType } from './enums/share-permission-type.enum';
import { IFileShare } from './interfaces/file-share.interface';
import { IFileTokenPayload } from './interfaces/file-token-payload.interface';
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
        private readonly _chatGateway: ChatGateway,
        private readonly _contactService: ContactService
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
            return [];
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

    async getFileInfo({ path }: { path: string }) {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isFile()) throw new BadRequestException('path is not a file');

            return await this.formatFileDetails({ path });
        } catch (error) {
            throw new NotFoundException(`unable to get file info: ${error}`);
        }
    }

    async getSharePath({ shareId }: { shareId: string }): Promise<string> {
        try {
            const share = await this._shareRepository.getShareById({ id: shareId });
            return share.path;
        } catch (error) {
            throw new NotFoundException(`share with id: ${shareId} not found`);
        }
    }

    async filterSharePermissions({ path, chatId }: { path: string; chatId: string }) {
        const share = await this.getShareByPath({ path });
        if (!share) return;
        const permissions = share.parsePermissions().filter(p => p.userId !== chatId);
        try {
            const chat = await this._chatService.getChat(chatId);
            if (!chat) return;

            const contacts = chat.parseContacts().filter(c => c.id !== this.userId || permissions.length === 0);
            for (const c of contacts) {
                if (!chat.isGroup && c.id === chatId) {
                    this._apiService.sendRemoveShare({
                        location: c.location,
                        shareId: share.id,
                        chatId: this.userId,
                    });
                    continue;
                }

                this._apiService.sendRemoveShare({ location: c.location, shareId: share.id, chatId });
            }
            if (permissions.length === 0) {
                const myLocation = (await this._locationService.getOwnLocation()) as string;
                this._apiService.sendRemoveShare({ location: myLocation, shareId: share.id, chatId });
                return;
            }

            await this._messageService.deleteShareMessages({ shareId: share.id, chatId });
            await this.updateShare(share, { ...share.toJSON(), permissions });
        } catch (error) {
            throw new BadRequestException(`unable to update share permissions: ${error}`);
        }
    }

    /**
     * Creates a directory.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path to the directory.
     * @return {PathInfoDTO} - PathInfoDTO.
     */
    async createDirectoryWithRetry({ path, count = 0 }: { path: string; count?: number }): Promise<PathInfoDTO> {
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot create new user data folder');
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
    async createFileWithRetry({
        fromPath,
        toPath,
        name,
        count = 0,
    }: {
        fromPath: string;
        toPath: string;
        name: string;
        count?: number;
    }): Promise<void> {
        const path = join(toPath, name);
        if (path === fromPath) return;
        const isFolder = this._fileService.isFolder(name);

        const beginOfPath = isFolder ? path : `${toPath}/${name.split('.')[0]}`;
        const endOfPath = isFolder ? '' : `.${name.split('.')[1]}`;

        const pathWithCount = count === 0 ? path : `${beginOfPath} (${count})${endOfPath}`;

        if (this._fileService.exists({ path: pathWithCount }))
            return this.createFileWithRetry({ fromPath, toPath, name, count: count + 1 });

        const share = await this._shareRepository.getShareByPath({ path: fromPath });
        if (share) {
            await this.updateShare(share, {
                ...share.toJSON(),
                path: pathWithCount,
                name: name,
            });
        }

        this._fileService.moveFile({ from: fromPath, to: pathWithCount });
    }

    async copyFileWithRetry({
        fromPath,
        toPath,
        name,
        count = 0,
    }: {
        fromPath: string;
        toPath: string;
        name: string;
        count?: number;
    }): Promise<void> {
        if (this.isUserFolder({ path: fromPath })) throw new ForbiddenException('cannot copy user data');

        const path = join(toPath, name);
        const isFolder = this._fileService.isFolder(name);

        const beginOfPath = isFolder ? path : `${toPath}/${name.split('.')[0]}`;
        const endOfPath = isFolder ? '' : `.${name.split('.')[1]}`;

        const pathWithCount = count === 0 ? path : `${beginOfPath} (${count})${endOfPath}`;

        if (this._fileService.exists({ path: pathWithCount })) {
            return this.copyFileWithRetry({ fromPath, toPath, name, count: count + 1 });
        }

        this._fileService.copyFile({ from: fromPath, to: pathWithCount });
    }

    async writeFile({ path, file }: { path: string; file: Buffer }) {
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot create user data file');
        this._fileService.writeFile({ path, content: file });
        return await this.formatFileDetails({ path });
    }

    /**
     * Renames a file or directory.
     * @param {Object} obj - Object.
     * @param {string} obj.from - Path to rename from.
     * @param {string} obj.to - Path to rename to.
     */
    async renameFileOrDirectory({ from, to }: RenameFileDTO): Promise<void> {
        if (this.isUserFolder({ path: from })) throw new ForbiddenException('cannot rename user data folder');
        if (!this._fileService.exists({ path: from }))
            throw new BadRequestException('unable to rename file, file does not exist');
        if (this._fileService.exists({ path: to }))
            throw new BadRequestException('unable to rename file, file with that name already exists');

        const share = await this._shareRepository.getShareByPath({ path: from });
        if (share) await this.updateShare(share, { ...share.toJSON(), path: to, name: to.split('/').pop() });

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
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot share user data folder');

        if (isWritable && isPublic) throw new BadRequestException('cannot share file as public and writable');

        const chat = await this._chatService.getChat(shareWith);

        if (!chat) return;

        const pathStats = await this._fileService.getStats({ path });

        const myLocation = await this._locationService.getOwnLocation();
        const me = {
            id: this.userId,
            location: myLocation as string,
        };

        const sharePermissionTypes = [SharePermissionType.READ];
        if (isWritable) sharePermissionTypes.push(SharePermissionType.WRITE);
        const sharePermissions: ISharePermission[] = [{ userId: shareWith, sharePermissionTypes }];

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

        let updatedShare = null;
        const existingShare = await this._shareRepository.getShareByPath({ path });
        if (existingShare?.id) {
            const updatedPermissions = existingShare.parsePermissions().map(permission => {
                if (permission.userId === shareWith)
                    return {
                        userId: shareWith,
                        sharePermissionTypes,
                    };

                return permission;
            });

            const existingSharePermissions = existingShare.parsePermissions().find(p => p.userId === shareWith);
            if (existingSharePermissions?.sharePermissionTypes.length === sharePermissionTypes.length) {
                return false;
            }

            const permissionExists = updatedPermissions.some(p => p.userId === shareWith);
            const permissions = permissionExists
                ? updatedPermissions
                : [...updatedPermissions, { userId: shareWith, sharePermissionTypes }];

            updatedShare = await this.updateShare(existingShare, {
                ...creationData,
                permissions,
            });
        }

        const msg: MessageDTO<IFileShareMessage> = {
            id: uuidv4(),
            chatId: chat.chatId,
            from: this.userId,
            to: shareWith,
            body: updatedShare ?? (await this.createFileShare(creationData)),
            timeStamp: new Date(),
            type: MessageType.FILE_SHARE,
            subject: null,
            signatures: [],
            replies: [],
        };
        const signedMsg = await this._keyService.appendSignatureToMessage({ message: msg });

        const contacts = chat.parseContacts().filter(c => c.id !== this.userId);

        for (const contact of contacts) {
            this._apiService.sendMessageToApi({ location: contact.location, message: signedMsg });
        }

        const userHasPermissions = msg.body.permissions.some(p => p.userId === shareWith);

        if (userHasPermissions) {
            await this._messageService.createMessage(signedMsg);
            this._chatGateway.emitMessageToConnectedClients('message', signedMsg);
        }

        return true;
    }

    async deleteFile({ path }: { path: string }) {
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot delete user data');

        const share = await this.getShareByPath({ path });
        try {
            if (share) {
                await this.deleteShare({ id: share.entityId });
                share.parsePermissions().map(async permission => {
                    await this._messageService.deleteShareMessages({ chatId: permission.userId, shareId: share.id });

                    const chat = await this._chatService.getChat(permission.userId);
                    let chatId = chat.chatId;
                    if (chat.isGroup) {
                        for (const c of chat.parseContacts()) {
                            this._apiService.sendRemoveShare({
                                location: c.location,
                                shareId: share.id,
                                chatId: chatId,
                            });
                        }
                        return;
                    }

                    const contact = await this._contactService.getContact({ id: permission.userId });
                    if (!contact) return;

                    if (chatId === contact.id) chatId = chat.parseContacts().filter(c => c.id !== contact.id)[0].id;
                    this._apiService.sendRemoveShare({
                        location: contact.location,
                        shareId: share.id,
                        chatId: chatId,
                    });
                });
            }
            const stats = await this._fileService.getStats({ path });
            if (stats.isDirectory()) {
                const files = await this._fileService.readDirectory({ path, options: { withFileTypes: true } });
                for (const file of files) {
                    await this.deleteFile({ path: join(path, file.name) });
                }
                return this._fileService.deleteDirectory({ path });
            }
            return this._fileService.deleteFile({ path });
        } catch (error) {
            throw new BadRequestException(`unable to delete file or folder: ${error}`);
        }
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

    async getShareById({ id }: { id: string }): Promise<Share> {
        try {
            return await this._shareRepository.getShareById({ id });
        } catch (error) {
            throw new NotFoundException('share does not exist');
        }
    }

    async getShareByPath({ path }: { path: string }): Promise<Share> {
        try {
            return await this._shareRepository.getShareByPath({ path });
        } catch (error) {
            return null;
        }
    }

    async deleteShare({ id }: { id: string }) {
        try {
            return await this._shareRepository.deleteShare({ entityId: id });
        } catch (error) {
            throw new BadRequestException(`unable to delete share: ${error}`);
        }
    }

    async handleIncomingDeleteShare({ share, chatId }: { share: Share; chatId: string }) {
        try {
            await this._messageService.deleteShareMessages({ chatId, shareId: share.id });
            return await this._shareRepository.deleteShare({ entityId: share.entityId });
        } catch (error) {
            throw new BadRequestException(`unable to delete share: ${error}`);
        }
    }

    /**
     * Deletes a user's permissions from a shared file.
     * @param {Object} obj - Object.
     * @param {string} obj.userId - User Id.
     */
    async deleteUserPermissions({ userId }: { userId: string }) {
        const myShares = await this._shareRepository.getMyShares();
        const sharedWithMe = await this._shareRepository.getSharedWithMe();

        sharedWithMe.forEach(async share => {
            const owner = share.parseOwner();
            if (owner.id === userId) await this.deleteShare({ id: share.entityId });
        });

        for (const share of myShares) {
            const permissions = share.parsePermissions();
            const newPermissions = permissions.filter(p => p.userId !== userId);
            if (newPermissions.length === permissions.length) continue;
            if (newPermissions.length > 0)
                return await this.updateShare(share, {
                    ...share.toJSON(),
                    permissions: newPermissions,
                });
            return await this.deleteShare({ id: share.entityId });
        }
    }

    /**
     * Creates a new file share.
     * @param {CreateFileShareDTO} dto - Creation object.
     * @return {IFileShare} - File share.
     */
    async createFileShare({
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
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot share user data folder');

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
     * @param isGroup
     * @param {CreateFileShareDTO} dto - Creation object.
     * @return {IFileShare} - Updated file share.
     */
    async updateShare(
        existingShare: Share,
        { path, owner, name, isFolder, isSharedWithMe, permissions, size }: CreateFileShareDTO,
        isGroup?: boolean
    ): Promise<IFileShare> {
        if (this.isUserFolder({ path })) throw new ForbiddenException('cannot share user data folder');

        existingShare.path = path;
        existingShare.owner = stringifyOwner(owner);
        existingShare.name = name;
        existingShare.isFolder = isFolder;
        existingShare.isSharedWithMe = isSharedWithMe;
        existingShare.permissions = stringifyPermissions(permissions);
        existingShare.size = size;
        existingShare.lastModified = new Date().getTime();

        permissions.map(async p => {
            const msg: MessageDTO<IFileShareMessage> = {
                id: uuidv4(),
                chatId: p.userId,
                from: this.userId,
                to: p.userId,
                body: existingShare.toJSON(),
                timeStamp: new Date(),
                type: MessageType.FILE_SHARE_UPDATE,
                subject: null,
                signatures: [],
                replies: [],
            };
            const signedMsg = await this._keyService.appendSignatureToMessage({ message: msg });

            const chat = await this._chatService.getChat(p.userId);
            if (!chat) return;
            await this._messageService.renameSharedMessage({ message: msg, chatId: chat.chatId });
            await this._messageService.renameQuotedFileShareMessages(msg);
            this._chatGateway.emitMessageToConnectedClients('chat_updated', {
                ...chat.toJSON(),
                messages: (await this._messageService.getAllMessagesFromChat({ chatId: chat.chatId })).map(m =>
                    m.toJSON()
                ),
            });

            if (!isGroup)
                chat.parseContacts()
                    .filter(c => c.id !== this.userId)
                    .forEach(c => {
                        this._apiService.sendMessageToApi({ location: c.location, message: signedMsg });
                    });
        });

        try {
            return (await this._shareRepository.updateShare({ share: existingShare })).toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to update file share in database: ${error}`);
        }
    }

    async getSharePermissionsByUser({ shareId, userId }: { shareId: string; userId: string }) {
        const share = await this.getShareById({ id: shareId });
        if (!share) return [];
        const permissions: SharePermissionType[] = [];
        await Promise.all(
            share.parsePermissions().map(async p => {
                const chat = await this._chatService.getChat(p.userId);
                if (chat.parseContacts().find(c => c.id === userId)) {
                    p.sharePermissionTypes.forEach(t => {
                        if (!permissions.some(c => c == t)) permissions.push(t);
                    });
                    return;
                }
            })
        );
        return permissions;
    }

    async generateQuantumJWT({ payload, exp }: { payload: IFileTokenPayload; exp?: number | string }): Promise<string> {
        const privateKey = await this._keyService.getKey({ userId: this.userId, keyType: KeyType.Private });

        return sign(payload, Buffer.from(privateKey.key), {
            expiresIn: exp ?? '9999 years',
            issuer: this.userId,
            audience: 'quantum',
        });
    }

    async verifyQuantumJWT({ token }: { token: string }): Promise<IFileTokenPayload> {
        const privateKey = await this._keyService.getKey({ userId: this.userId, keyType: KeyType.Private });
        try {
            return verify(token, Buffer.from(privateKey.key)) as IFileTokenPayload;
        } catch (error) {
            throw new UnauthorizedException(`unable to verify quantum token: ${error}`);
        }
    }

    getQuantumFileToken({ writable, path }: { writable: boolean; path: string }): string {
        const fileBuffer = this._fileService.readFile({ path });
        const hex = createHash('sha256').update(fileBuffer).digest('hex');
        return createHash('sha1')
            .update(`${writable ? 'write' : 'read'}${path}${hex}`)
            .digest('hex');
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
     * Checks if the given path is the users config directory.
     * @param {Object} obj - Object containing the path to check.
     * @param {string} obj.path - Path to check.
     * @return {boolean} - True if the path is the users config directory.
     */
    private isUserFolder({ path }: { path: string }): boolean {
        const configPath = `${this._configService.get<string>('baseDir')}storage/${this.userId}`;
        return path.startsWith(configPath);
    }
}
