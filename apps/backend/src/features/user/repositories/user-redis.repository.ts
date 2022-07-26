import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { User, userSchema } from '../models/user.model';

@Injectable()
export class UserRedisRepository extends EntityRepository<User> {
    constructor(dbService: DbService) {
        super(dbService, userSchema);
    }

    /**
     * Adds user data to Redis.
     * @param {Object} obj - Object.
     * @param {string} obj.userId - Users Id.
     * @param {string} obj.status - Users status (online/offline).
     * @param {string} obj.avatar - Users avatar URL.
     * @param {string} obj.lastSeen - When the user was last active.
     * @return {User} - Created entity.
     */
    async addUserData({
        userId,
        status,
        avatar,
        lastSeen,
    }: {
        userId: string;
        status: string;
        avatar: string;
        lastSeen: number;
    }): Promise<User> {
        return await this.save({ userId, status, avatar, lastSeen });
    }

    /**
     * Gets user data.
     * @param {string} Id - User id.
     * @return {User} - Found User data.
     */
    async getUserData({ id }: { id: string }): Promise<User> {
        return await this.findOne({ where: 'userId', eq: id });
    }

    /**
     * Updates user data.
     * @param {User} user - Updates user data.
     * @return {string} - Updated user Id.
     */
    async updateUserData(user: User): Promise<string> {
        return await this.update(user);
    }
}
