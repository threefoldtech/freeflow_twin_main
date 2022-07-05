import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { uuidv4 } from '../../utils/uuid';
import { LocationService } from '../location/location.service';
import { User } from './models/user.model';
import { UserRedisRepository } from './repositories/user-redis.repository';

@Injectable()
export class UserService {
    private myAddress: string;

    constructor(
        private readonly _userRepo: UserRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _locationService: LocationService
    ) {}

    /**
     * Adds user data to Redis.
     * @param {Object} userData - Object.
     * @return {User} - Created entity.
     */
    async addUserData(userData: { userId: string; status: string; avatar: string; lastSeen: number }): Promise<User> {
        try {
            return await this._userRepo.addUserData(userData);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    /**
     * Gets user data.
     * @return {User} - Found User data.
     */
    async getUserData(): Promise<User> {
        const userId = this._configService.get<string>('userId');
        try {
            const user = await this._userRepo.getUserData({ id: userId });
            if (!user)
                return await this.addUserData({
                    userId,
                    status: 'Exploring the new DigitalTwin',
                    avatar: 'default',
                    lastSeen: new Date().getTime(),
                });

            return user;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getUserAvatar(): Promise<string> {
        if (!this.myAddress) this.myAddress = (await this._locationService.getOwnLocation()) as string;
        return `http://[${this.myAddress}]/api/v2/user/avatar/${uuidv4()}`;
    }

    /**
     * Updates user data to Redis.
     * @param {User} userData - Data to update user data with.
     * @return {string} - Updated user data ID.
     */
    async updateUserData(userData: User): Promise<string> {
        try {
            const userToUpdate = await this.getUserData();
            userToUpdate.status = userData.status;
            userToUpdate.avatar = userData.avatar;
            userToUpdate.lastSeen = userData.lastSeen;
            return await this._userRepo.updateUserData(userToUpdate);
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    /**
     * Updates the avatar path to user data.
     * @param {string} path - Avatar path.
     * @return {string} - Updated user data ID.
     */
    async updateAvatar({ path }: { path: string }): Promise<string> {
        try {
            const userToUpdate = await this.getUserData();
            userToUpdate.avatar = path;
            userToUpdate.lastSeen = new Date().getTime();
            await this._userRepo.updateUserData(userToUpdate);
            if (!this.myAddress) this.myAddress = (await this._locationService.getOwnLocation()) as string;
            return `http://[${this.myAddress}]/api/v2/user/avatar/${uuidv4()}`;
        } catch (error) {
            throw new BadRequestException(`failed to update avatar: ${error}`);
        }
    }

    /**
     * Updates the user status.
     * @param {string} status - Updated status.
     */
    async updateStatus({ status }: { status: string }): Promise<boolean> {
        try {
            const userToUpdate = await this.getUserData();
            userToUpdate.status = status;
            userToUpdate.lastSeen = new Date().getTime();
            await this._userRepo.updateUserData(userToUpdate);
            return true;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
