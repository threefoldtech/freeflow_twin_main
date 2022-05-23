import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'redis-om';

import { DbService } from '../../db/db.service';
import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from '../dtos/blocked-contact.dto';
import { BlockedContact, blockedContactSchema } from '../models/blocked-contact.model';
import { BlockedContactRepository } from '../types/blocked-contact.repository';

@Injectable()
export class BlockedContactRedisRepository implements BlockedContactRepository {
    private _blockedContactRedisRepo: Repository<BlockedContact>;

    constructor(private readonly _dbService: DbService) {
        this._blockedContactRedisRepo = this._dbService.createRepository(blockedContactSchema);
        this._blockedContactRedisRepo.createIndex();
    }

    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContacts(): Promise<string[]> {
        try {
            const contacts = await this._blockedContactRedisRepo.search().return.all();
            return contacts.map(c => c.id);
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @return {string} - Blocked contact id.
     */
    async addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string> {
        try {
            const contact = await this._blockedContactRedisRepo.createAndSave({
                id,
            });
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
            const contact = await this._blockedContactRedisRepo.search().where('id').eq(id).return.first();
            return await this._blockedContactRedisRepo.remove(contact.entityId);
        } catch (error) {
            throw new BadRequestException(`unable to remove contact from blocked list: ${error}`);
        }
    }
}
