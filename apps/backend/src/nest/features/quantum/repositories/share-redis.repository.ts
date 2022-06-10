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
            size,
            lastModified,
            permissions: stringifyPermissions(permissions),
        });
    }
}
