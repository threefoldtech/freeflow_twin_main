import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from './dtos/blocked-contact.dto';
import { BlockedContact } from './models/blocked-contact.model';
import { BlockedContactRedisRepository } from './repositories/blocked-contact-redis.repository';
import { ContactService } from '../contact/contact.service';
import { ApiService } from '../api/api.service';
import { ConfigService } from '@nestjs/config';
import { MessageService } from '../message/message.service';
import { ChatRedisRepository } from '../chat/repositories/chat-redis.repository';
import { ChatDTO } from '../chat/dtos/chat.dto';

@Injectable()
export class BlockedContactService {
    constructor(
        private _blockedContactRepo: BlockedContactRedisRepository,
        private _contactService: ContactService,
        private _apiService: ApiService,
        private _configService: ConfigService,
        private _chatRepo: ChatRedisRepository,
        private _messageService: MessageService
    ) {}

    /**
     * Adds a contact to blocked list and removes it from contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Contact ID.
     * @return {string} - Blocked contact id.
     */
    async addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string> {
        try {
            const userId = this._configService.get<string>('userId');
            const contact = await this._contactService.setContactAccepted(id, false);
            this._apiService.setContactAccepted(userId, contact.location, false);

            const blockedContact = await this._blockedContactRepo.addBlockedContact({ id });
            return blockedContact.id;
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
            const userId = this._configService.get<string>('userId');
            const contact = await this._contactService.setContactAccepted(id, true);
            this._apiService.setContactAccepted(userId, contact.location, true);

            const blockedContact = await this._blockedContactRepo.getBlockedContact({ id });
            return await this._blockedContactRepo.deleteBlockedContact({ id: blockedContact.entityId });
        } catch (error) {
            throw new BadRequestException(`unable to remove contact from blocked list: ${error}`);
        }
    }

    /**
     * Gets blocked contact ids using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContactIds(): Promise<string[]> {
        try {
            return (await this._blockedContactRepo.getBlockedContacts()).map(c => c.id);
        } catch (error) {
            return [];
        }
    }

    /**
     * Gets blocked contacts using pagination.
     * @return {string[]} - Found blocked contacts ids.
     */
    async getBlockedContacts(): Promise<BlockedContact[]> {
        try {
            return await this._blockedContactRepo.getBlockedContacts();
        } catch (error) {
            return [];
        }
    }

    /**
     * Checks if a user is blocked or not.
     * @return {boolean} - True if the user is blocked, false otherwise.
     */
    async isBlocked({ userId }: { userId: string }): Promise<boolean> {
        return (await this.getBlockedContactIds()).includes(userId);
    }

    /**
     * Gets chats using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 50.
     * @return {ChatDTO[]} - Found chats.
     */
    async getUnblockedChats({ offset = 0, count = 50 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        try {
            const chats = await this._chatRepo.getChats({ offset, count });
            const contacts = await this._contactService.getContacts();
            const blockedContacts = await this.getBlockedContacts();
            chats.forEach(c => {
                const contact = contacts.find(contact => contact.id === c.chatId);
                const blockedContact = blockedContacts.find(contact => contact.id === c.chatId);
                if (!contact && !c.isGroup && blockedContact) {
                    chats.splice(chats.indexOf(c), 1);
                }
            });
            const chatDTOs = chats.map(c => c.toJSON());
            for (let i = 0; i < chatDTOs.length; i++) {
                const chatMessages = await this._messageService.getMessagesFromChat({
                    chatId: chatDTOs[i].chatId,
                    count,
                });
                chatDTOs[i].messages = chatMessages ?? [];
            }
            return chatDTOs;
        } catch (error) {
            throw new NotFoundException('no chats found');
        }
    }
}
