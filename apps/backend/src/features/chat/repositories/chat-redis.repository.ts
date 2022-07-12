import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { stringifyMessage } from '../../message/models/message.model';
import { CreateChatDTO } from '../dtos/chat.dto';
import { Chat, chatSchema, stringifyContacts, stringifyRead } from '../models/chat.model';

@Injectable()
export class ChatRedisRepository extends EntityRepository<Chat> {
    constructor(readonly dbService: DbService) {
        super(dbService, chatSchema);
    }

    /**
     * Creates a new chat.
     * @param {Object} obj - Object.
     * @param {string} obj.name - The name of the new chat.
     * @param {Contact[]} obj.contacts - List of chat contacts.
     * @param {Message[]} obj.messages - List of chat messages.
     * @param {string} obj.adminId - Admin ID of the chat.
     * @param {string[]} obj.read - Group of user IDs that have read the last messages in chat.
     * @param {boolean} obj.isGroup - Group chat or not.
     * @param {Message[]} obj.draft - List of draft messages.
     * @return {Chat} - Created entity.
     */
    async createChat({
        chatId,
        name,
        contacts,
        acceptedChat,
        adminId,
        read,
        isGroup,
        draft,
    }: CreateChatDTO): Promise<Chat> {
        return await this.save({
            chatId,
            name,
            contacts: stringifyContacts(contacts),
            acceptedChat,
            adminId,
            read: read ? stringifyRead(read) : [],
            isGroup,
            draft: draft ? stringifyMessage(draft) : null,
        });
    }

    /**
     * Updates a chat.
     * @param {Chat} chat - Updated chat.
     * @return {string} - Chat Id.
     */
    async updateChat(chat: Chat): Promise<string> {
        return await this.update(chat);
    }

    /**
     * Gets chats using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 50.
     * @return {ChatDTO[]} - Found chats.
     */
    async getChats({ offset = 0, count = 50 }: { offset?: number; count?: number } = {}): Promise<Chat[]> {
        return await this.findAllPaginated({ offset, count });
    }

    /**
     * Gets accepted chats using pagination.
     * @param {Object} obj - Object.
     * @param {number }obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 25.
     * @return {Chat[]} - Found chats.
     */
    async getAcceptedChats({ offset = 0, count = 25 }: { offset?: number; count?: number } = {}): Promise<Chat[]> {
        return await this.findAllWhereEqPaginated({ offset, count, where: 'acceptedChat', eq: true });
    }

    /**
     * Gets a chat by its ID.
     * @param {string} chatId - Chat ID.
     * @return {Chat} - Found chat.
     */
    async getChat(chatId: string): Promise<Chat> {
        return await this.findOne({ where: 'chatId', eq: chatId });
    }

    /**
     * Deletes a chat by its ID.
     * @param {string} chatId - Chat ID.
     */
    async deleteChat(chatId: string): Promise<void> {
        return await this.delete(chatId);
    }
}
