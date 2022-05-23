import { Injectable } from '@nestjs/common';

import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from './dtos/blocked-contact.dto';
import { BlockedContactRepository } from './types/blocked-contact.repository';

@Injectable()
export class BlockedContactService {
    constructor(private _blockedContactRepo: BlockedContactRepository) {}

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @return {string} - Blocked contact id.
     */
    async addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string> {
        return await this._blockedContactRepo.addBlockedContact({ id });
    }

    /**
     * Deletes a contact from blocked list and adds it to contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     */
    async deleteBlockedContact({ id }: DeleteBlockedContactDTO): Promise<void> {
        return await this._blockedContactRepo.deleteBlockedContact({ id });
    }

    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContactList(): Promise<string[]> {
        return await this._blockedContactRepo.getBlockedContacts();
    }
}
