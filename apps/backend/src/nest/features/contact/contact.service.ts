import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ContactRequest, MessageBody, MessageType } from '../../types/message-types';
import { uuidv4 } from '../../utils/uuid';
import { ApiService } from '../api/api.service';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from '../chat/chat.service';
import { KeyService } from '../key/key.service';
import { LocationService } from '../location/location.service';
import { CreateMessageDTO, MessageDTO } from '../message/dtos/message.dto';
import { MessageService } from '../message/message.service';
import { Message } from '../message/models/message.model';
import { CreateContactDTO, DeleteContactDTO } from './dtos/contact.dto';
import { Contact } from './models/contact.model';
import { ContactRedisRepository } from './repositories/contact-redis.repository';

@Injectable()
export class ContactService {
    constructor(
        private readonly _contactRepo: ContactRedisRepository,
        private readonly _messageService: MessageService,
        private readonly _locationService: LocationService,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _apiService: ApiService,
        @Inject(forwardRef(() => ChatService))
        private readonly _chatService: ChatService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly _chatGateway: ChatGateway
    ) {}

    /**
     * Gets contacts using pagination.
     * @return {EntityData[]} - Found contacts entity data.
     */
    async getContacts(): Promise<Contact[]> {
        try {
            return await this._contactRepo.getContacts();
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
            return await this._contactRepo.getContact({ id });
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
        const me = {
            id: this._configService.get<string>('userId'),
            location: yggdrasilAddress as string,
        };

        let newContact = await this.getContact({ id });
        if (!newContact) {
            try {
                newContact = await this._contactRepo.addNewContact({
                    id,
                    location,
                    contactRequest: false,
                });
            } catch (error) {
                throw new BadRequestException(`unable to create contact: ${error}`);
            }
        }

        const signedMessage = await this._keyService.appendSignatureToMessage({ message });
        const newMessage = await this._messageService.createMessage(signedMessage);
        const chat = await this._chatService.createChat({
            chatId: newContact.id,
            name: newMessage.to,
            contacts: [newContact, me],
            acceptedChat: true,
            adminId: newContact.id,
            read: [],
            isGroup: false,
            draft: [],
            messages: [signedMessage],
        });

        const contactRequest: MessageDTO<ContactRequest> = {
            id: uuidv4(),
            chatId: chat.chatId,
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

        this._chatGateway.emitMessageToConnectedClients('connection_request', chat);

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
    async handleIncomingContactRequest({
        id,
        location,
        contactRequest,
        message,
    }: CreateContactDTO<ContactRequest>): Promise<Contact> {
        const yggdrasilAddress = await this._locationService.getOwnLocation();
        const me = {
            id: this._configService.get<string>('userId'),
            location: yggdrasilAddress as string,
        };

        const existingContact = await this.getContact({ id });
        if (existingContact) return;

        let newContact;
        try {
            newContact = await this._contactRepo.addNewContact({
                id,
                location,
                contactRequest,
            });
        } catch (error) {
            throw new BadRequestException(`unable to create contact: ${error}`);
        }

        const contactRequestMsg: CreateMessageDTO<string> = {
            id: uuidv4(),
            chatId: message.from,
            from: message.from,
            to: message.to,
            body: JSON.stringify(`You have received a new message request from ${message.from}`),
            timeStamp: new Date(),
            type: MessageType.SYSTEM,
            subject: null,
            signatures: message.signatures ?? [],
            replies: [],
        };
        await this._messageService.createMessage(contactRequestMsg);

        const chat = await this._chatService.createChat({
            chatId: message.from,
            name: message.from,
            contacts: [me, newContact],
            acceptedChat: false,
            adminId: message.from,
            read: [],
            isGroup: false,
            draft: [],
            messages: [contactRequestMsg],
        });

        this._chatGateway.emitMessageToConnectedClients('connection_request', chat);
        return newContact;
    }

    /**
     * Gets a contact that has accepted the chat request (contactRequest is false).
     * @param {string} id - Contacts Id.
     * @return {Contact} - Found contact.
     */
    async getAcceptedContact({ id }: { id: string }): Promise<Contact> {
        try {
            return await this._contactRepo.getAcceptedContact({ id });
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
            return await this._contactRepo.addNewContact({
                id,
                location,
                contactRequest: false,
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
        const contact = await this.getContact({ id });
        try {
            return await this._contactRepo.deleteContact({ id: contact.entityId });
        } catch (error) {
            throw new BadRequestException(`unable remove contact: ${error}`);
        }
    }
}
