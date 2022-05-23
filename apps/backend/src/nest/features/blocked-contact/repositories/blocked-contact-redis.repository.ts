import { BadRequestException, Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from '../dtos/blocked-contact.dto';
import { BlockedContact, blockedContactSchema } from '../models/blocked-contact.model';

@Injectable()
export class BlockedContactRedisRepository extends EntityRepository<BlockedContact> {
    constructor(readonly dbService: DbService) {
        super(dbService, blockedContactSchema);
    }

    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContacts(): Promise<string[]> {
        try {
            const contacts = await this.findAll({});
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
            const contact = await this.save({ id });
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
            const contact = await this.findOne({ where: 'id', eq: id });
            return await this.delete(contact.entityId);
        } catch (error) {
            throw new BadRequestException(`unable to remove contact from blocked list: ${error}`);
        }
    }
}
