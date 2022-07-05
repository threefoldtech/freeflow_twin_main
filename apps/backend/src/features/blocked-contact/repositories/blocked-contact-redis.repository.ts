import { Injectable } from '@nestjs/common';

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
     * Gets a blocked contact by id.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact Id.
     * @return {BlockedContact} - Found blocked contact.
     */
    async getBlockedContact({ id }: { id: string }): Promise<BlockedContact> {
        return await this.findOne({ where: 'id', eq: id });
    }

    /**
     * Gets blocked contacts.
     * @return {BlockedContact[]} - Found blocked contacts.
     */
    async getBlockedContacts(): Promise<BlockedContact[]> {
        return await this.findAll();
    }

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact Id.
     * @return {BlockedContact} - Blocked contact.
     */
    async addBlockedContact({ id }: CreateBlockedContactDTO): Promise<BlockedContact> {
        return await this.save({ id });
    }

    /**
     * Deletes a contact from blocked list.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact Id.
     */
    async deleteBlockedContact({ id }: DeleteBlockedContactDTO): Promise<void> {
        return await this.delete(id);
    }
}
