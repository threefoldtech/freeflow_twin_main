import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from '../dtos/blocked-contact.dto';

export abstract class BlockedContactRepository {
    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    abstract getBlockedContacts(): Promise<string[]>;

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @return {string} - Blocked contact id.
     */
    abstract addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string>;

    /**
     * Deletes a contact from blocked list and adds it to contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     */
    abstract deleteBlockedContact({ id }: DeleteBlockedContactDTO): Promise<void>;
}
