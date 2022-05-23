import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from './dtos/blocked-contact.dto';
import { BlockedContactRedisRepository } from './repositories/blocked-contact-redis.repository';

@Injectable()
export class BlockedContactService {
    constructor(private _blockedContactRepo: BlockedContactRedisRepository) {}

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @return {string} - Blocked contact id.
     */
    async addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string> {
        try {
            const contact = await this._blockedContactRepo.addBlockedContact({ id });
            return contact.id;
        } catch (error) {
            throw new BadRequestException(`unable to add contact to blocked list: ${error}`);
        }
    }

    /**
     * Deletes a contact from blocked list and adds it to contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     */
    async deleteBlockedContact({ id }: DeleteBlockedContactDTO): Promise<void> {
        try {
            const contact = await this._blockedContactRepo.getBlockedContact({ id });
            return await this._blockedContactRepo.deleteBlockedContact({ id: contact.entityId });
        } catch (error) {
            throw new BadRequestException(`unable to remove contact from blocked list: ${error}`);
        }
    }

    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContactList({ offset, count }: { offset: number; count: number }): Promise<string[]> {
        try {
            const contacts = await this._blockedContactRepo.getBlockedContacts({ offset, count });
            return contacts.map(c => c.id);
        } catch (error) {
            return [];
        }
    }
}
