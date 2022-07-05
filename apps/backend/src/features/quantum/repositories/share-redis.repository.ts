import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { CreateFileShareDTO } from '../dtos/share-file.dto';
import { Share, shareSchema, stringifyOwner, stringifyPermissions } from '../models/share.model';

@Injectable()
export class ShareRedisRepository extends EntityRepository<Share> {
    constructor(readonly dbService: DbService) {
        super(dbService, shareSchema);
    }

    /**
     * Saves a share to the database.
     * @param {Object} obj - Object.
     * @param {string} obj.path - Path of the share.
     * @param {ContactDTO} obj.owner - Owner of the share.
     * @param {boolean} obj.isFolder - Whether the share is a folder or a file.
     * @param {boolean} obj.isSharedWithMe - Whether the share is shared with me.
     * @param {number} obj.size - Size of the share.
     * @param {number} obj.lastModified - Last modified date of the share.
     * @param {ISharePermission[]} obj.permissions - Permissions of the share.
     * @return {Share} - Created entity.
     */
    async createShare({
        id,
        path,
        owner,
        name,
        isFolder,
        isSharedWithMe,
        size,
        lastModified,
        permissions,
    }: CreateFileShareDTO): Promise<Share> {
        return await this.save({
            id,
            path,
            owner: stringifyOwner(owner),
            name,
            isFolder,
            isSharedWithMe,
            size,
            lastModified,
            permissions: stringifyPermissions(permissions),
        });
    }

    async getMyShares(): Promise<Share[]> {
        return await this.findAllWhereEq({ where: 'isSharedWithMe', eq: false });
    }

    async getSharedWithMe(): Promise<Share[]> {
        return await this.findAllWhereEq({ where: 'isSharedWithMe', eq: true });
    }

    /**
     * Gets a share by its Id.
     * @param {string} id - Share Id.
     * @return {Chat} - Found share.
     */
    async getShareById({ id }: { id: string }): Promise<Share> {
        return await this.findOne({ where: 'id', eq: id });
    }

    /**
     * Gets a share that has been shared with the user by its Id.
     * @param {string} id - Share Id.
     * @return {Chat} - Found share.
     */
    async getSharedWithMeById({ id }: { id: string }): Promise<Share> {
        return await this.findOneAnd({ where: 'id', eq: id, and: 'isSharedWithMe', andEq: true });
    }

    /**
     * Gets a share by its path.
     * @param {string} path - Share path.
     * @return {Chat} - Found share.
     */
    async getShareByPath({ path }: { path: string }): Promise<Share> {
        return await this.findOneAnd({ where: 'path', eq: path, and: 'isSharedWithMe', andEq: false });
    }

    async updateShare({ share }: { share: Share }): Promise<Share> {
        await this.update(share);
        return share;
    }

    async deleteShare({ entityId }: { entityId: string }) {
        return await this.delete(entityId);
    }
}
