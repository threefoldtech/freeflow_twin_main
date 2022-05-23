import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'redis-om';

import { ContactRequest, MessageBody, MessageType } from '../../types/message-types';
import { uuidv4 } from '../../utils/uuid';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { DbService } from '../db/db.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { Message } from '../message/models/message.model';
import { CreateContactDTO, DeleteContactDTO } from './dtos/contact.dto';
import { Contact, contactSchema } from './models/contact.model';

@Injectable()
export class ContactService {
    private _contactRepo: Repository<Contact>;

    constructor(
        private readonly _dbService: DbService,
        private readonly _messageService: MessageService,
        private readonly _locationService: LocationService,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _apiService: ApiService,
        @Inject(forwardRef(() => ChatService))
        private readonly _chatService: ChatService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly _chatGateway: ChatGateway
    ) {
        this._contactRepo = this._dbService.createRepository(contactSchema);
        this._contactRepo.createIndex();
    }

    /**
     * Gets contacts using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Contact offset, defaults to 0.
     * @param {number} obj.count - Amount of contacts to fetch, defaults to 50.
     * @return {Contact[]} - Found contacts.
     */
    async getContacts({ offset = 0, count = 50 }: { offset?: number; count?: number } = {}): Promise<Contact[]> {
        try {
            return await this._contactRepo.search().return.page(offset, count);
        } catch {
            return [];
        }
    }

    /**
     * Gets a contact by id.
     * @param {string} id - Contact id.
     * @return {Contact} - Found contact.
     */
    async getContact({ id }: { id: string }): Promise<Contact> {
        try {
            return await this._contactRepo.search().where('id').equals(id).return.first();
        } catch (error) {
            throw new NotFoundException('contact not found');
        }
    }

    /**
     * Creates a new contact.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @param {string} obj.location - Contact IPv6.
     * @param {CreateMessageDTO} obj.message - Contact request message.
     * @return {Contact} - Created entity.
     */
    async createNewContact({ id, location, message }: CreateContactDTO<MessageBody>): Promise<Contact> {
        const yggdrasilAddress = await this._locationService.getOwnLocation();
        // createEntity without saving to Redis
        const me = this._contactRepo.createEntity({
            id: this._configService.get<string>('userId'),
            location: yggdrasilAddress as string,
        });

        const newMessage = await this._messageService.createMessage(message);

        let newContact;
        try {
            newContact = await this.getContact({ id });
            if (!newContact)
                newContact = await this._contactRepo.createAndSave({
                    id,
                    location,
                    contactRequest: false,
                });
        } catch (error) {
            throw new BadRequestException(`unable to create contact: ${error}`);
        }

        const signedMessage = await this._keyService.appendSignatureToMessage({ message: newMessage });
        const chat = await this._chatService.createChat({
            chatId: newContact.id,
            name: newMessage.to,
            contacts: [newContact, me],
            messages: [signedMessage],
            acceptedChat: true,
            adminId: newContact.id,
            read: [],
            isGroup: false,
            draft: [],
        });

        const contactRequest: MessageDTO<ContactRequest> = {
            id: uuidv4(),
            from: newMessage.from,
            to: newContact.id,
            body: {
                id: newMessage.from,
                location: yggdrasilAddress as string,
            },
            timeStamp: new Date(),
            type: MessageType.CONTACT_REQUEST,
            subject: null,
            signatures: [],
            replies: [],
        };
        const signedContactRequest = await this._keyService.appendSignatureToMessage({
            message: contactRequest as unknown as Message,
        });

        await this._apiService.sendMessageToApi({ location: newContact.location, message: signedContactRequest });

        this._chatGateway.emitMessageToConnectedClients('connection_request', chat.toJSON());

        return newContact;
    }

    /**
     * Creates a new contact request.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @param {string} obj.location - Contact IPv6.
     * @param {CreateMessageDTO} obj.message - Contact request message.
     * @return {Contact} - Created entity.
     */
    async createNewContactRequest({
        id,
        location,
        contactRequest,
        message,
    }: CreateContactDTO<ContactRequest>): Promise<Contact> {
        const yggdrasilAddress = await this._locationService.getOwnLocation();
        const me = this._contactRepo.createEntity({
            id: this._configService.get<string>('userId'),
            location: yggdrasilAddress as string,
        });

        let newContact;
        try {
            newContact = await this.getContact({ id });
            if (!newContact)
                newContact = await this._contactRepo.createAndSave({
                    id,
                    location,
                    contactRequest,
                });
        } catch (error) {
            throw new BadRequestException(`unable to create contact: ${error}`);
        }

        const contactRequestMsg: MessageDTO<string> = {
            id: uuidv4(),
            from: message.from,
            to: message.to,
            body: JSON.stringify(`You have received a new message request from ${message.from}`),
            timeStamp: new Date(),
            type: MessageType.SYSTEM,
            subject: null,
            signatures: message.signatures ?? [],
            replies: [],
        };

        const chat = await this._chatService.createChat({
            chatId: message.from,
            name: message.from,
            contacts: [me, newContact],
            messages: [contactRequestMsg as Message],
            acceptedChat: false,
            adminId: message.to,
            read: [],
            isGroup: false,
            draft: [],
        });

        this._chatGateway.emitMessageToConnectedClients('connection_request', chat.toJSON());
        return newContact;
    }

    /**
     * Gets a contact that has accepted the chat request (contactRequest is false).
     * @param {string} contactId - Contacts Id.
     * @return {Contact} - Found contact.
     */
    async getAcceptedContact({ contactId }: { contactId: string }): Promise<Contact> {
        try {
            return await this._contactRepo
                .search()
                .where('id')
                .eq(contactId)
                .and('contactRequest')
                .false()
                .return.first();
        } catch (error) {
            throw new NotFoundException(`contact not found`);
        }
    }

    /**
     * Adds an existing contact.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @param {string} obj.location - Contact IPv6.
     * @return {Contact} - Contact entity.
     */
    async addContact({ id, location }: CreateContactDTO<ContactRequest>): Promise<Contact> {
        const existingContact = await this.getContact({ id });
        if (existingContact) return;
        try {
            return await this._contactRepo.createAndSave({
                id,
                location,
            });
        } catch (error) {
            throw new BadRequestException(`unable to add contact: ${error}`);
        }
    }

    /**
     * Deletes a contact.
     * @param {string} id - Contact ID.
     */
    async deleteContact({ id }: DeleteContactDTO): Promise<void> {
        try {
            const contact = await this._contactRepo.search().where('id').eq(id).return.first();
            return await this._contactRepo.remove(contact.entityId);
        } catch (error) {
            throw new BadRequestException(`unable remove contact: ${error}`);
        }
    }
}
