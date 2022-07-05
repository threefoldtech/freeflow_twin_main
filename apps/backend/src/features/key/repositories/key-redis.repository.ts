import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { Key, keySchema, KeyType } from '../models/key.model';

@Injectable()
export class KeyRedisRepository extends EntityRepository<Key> {
    constructor(readonly dbService: DbService) {
        super(dbService, keySchema);
    }

    /**
     * Gets the public or private key of given user Id.
     * @param {Object} obj - Object.
     * @param {KeyType} obj.keyType - Key type to get.
     * @param {string} obj.userId - User Id to get key from.
     * @return {Key} - Found public or private key.
     */
    async getKey({ keyType, userId }: { keyType: KeyType; userId: string }): Promise<Key> {
        return await this.findOneAnd({ where: 'keyType', eq: keyType, and: 'userId', andEq: userId });
    }

    /**
     * Creates a key.
     * @param {Object} obj - Object.
     * @param {string} obj.userId - User Id.
     * @param {string} obj.key - Key string.
     * @param {KeyType} obj.keyType - Key type.
     * @return {Key} - Created Key.
     */
    async createKey({ userId, key, keyType }: Key): Promise<Key> {
        return await this.save({ userId, key, keyType });
    }

    /**
     * Updates a key.
     * @param {Key} key - Updated key.
     * @return {string} - Key Id.
     */
    async updateKey(key: Key): Promise<string> {
        return await this.update(key);
    }
}
