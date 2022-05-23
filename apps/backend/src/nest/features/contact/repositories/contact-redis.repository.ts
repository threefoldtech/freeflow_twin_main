import { Injectable } from '@nestjs/common';

import { MessageBody } from '../../../types/message-types';
import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { CreateContactDTO, DeleteContactDTO } from '../dtos/contact.dto';
import { Contact, contactSchema } from '../models/contact.model';

@Injectable()
export class ContactRedisRepository extends EntityRepository<Contact> {
    constructor(readonly dbService: DbService) {
        super(dbService, contactSchema);
    }

    /**
     * Gets contacts using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Contact offset, defaults to 0.
     * @param {number} obj.count - Amount of contacts to fetch, defaults to 50.
     * @return {Contact[]} - Found contacts.
     */
    async getContacts({ offset = 0, count = 50 }: { offset?: number; count?: number } = {}): Promise<Contact[]> {
        return await this.findAll({ offset, count });
    }

    /**
     * Gets a contact by id.
     * @param {string} id - Contact id.
     * @return {Contact} - Found contact.
     */
    async getContact({ id }: { id: string }): Promise<Contact> {
        return await this.findOne({ where: 'id', eq: id });
    }

    async getAcceptedContact({ id }: { id: string }) {
        return await this.findOneAnd({ where: 'id', eq: id, and: 'contactRequest', andEq: false });
    }

    /**
     * Creates a new contact.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @param {string} obj.location - Contact IPv6.
     * @param {boolean} obj.contactRequest - Contact request.
     * @return {Contact} - Created entity.
     */
    async addNewContact({ id, location, contactRequest }: CreateContactDTO<MessageBody>): Promise<Contact> {
        return await this.save({ id, location, contactRequest });
    }

    /**
     * Deletes a contact.
     * @param {string} id - Contact ID.
     */
    async deleteContact({ id }: DeleteContactDTO): Promise<void> {
        return await this.delete(id);
    }
}
