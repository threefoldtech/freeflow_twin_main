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
     * @return {Contact[]} - Found contacts.
     */
    async getContacts(): Promise<Contact[]> {
        return await this.findAll();
    }

    /**
     * Gets a contact by id.
     * @param {string} id - Contact id.
     * @return {Contact} - Found contact.
     */
    async getContact({ id }: { id: string }): Promise<Contact> {
        return await this.findOne({ where: 'id', eq: id });
    }

    /**
     * Gets a contact by location.
     * @param {string} location - Contact location.
     * @return {Contact} - Found contact.
     */
    async getContactByLocation({ location }: { location: string }): Promise<Contact> {
        return await this.findOne({ where: 'location', eq: location });
    }

    /**
     * Gets a contact that has accepted the chat request (contactRequest is false).
     * @param {string} id - Contacts Id.
     * @return {Contact} - Found contact.
     */
    async getAcceptedContact({ id }: { id: string }): Promise<Contact> {
        return await this.findOneAnd({ where: 'id', eq: id, and: 'contactRequest', andEq: false });
    }

    /**
     * Creates a new contact.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @param {string} obj.location - Contact IPv6.
     * @param {boolean} obj.contactRequest - Contact request.
     * @param {boolean} obj.accepted - Contact accepted.
     * @return {Contact} - Created entity.
     */
    async addNewContact({
        id,
        location,
        contactRequest,
        accepted,
        containerOffline,
    }: CreateContactDTO<MessageBody>): Promise<Contact> {
        return await this.save({ id, location, contactRequest, accepted, containerOffline });
    }

    /**
     * Deletes a contact.
     * @param {string} id - Contact ID.
     */
    async deleteContact({ id }: DeleteContactDTO): Promise<void> {
        return await this.delete(id);
    }

    /**
     * Updates a contact.
     * @param {string} id - Contact ID.
     */
    async updateContact({ contact }: { contact: Contact }) {
        await this.update(contact);
        return contact;
    }
}
