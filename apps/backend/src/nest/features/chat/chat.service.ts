import { Injectable } from '@nestjs/common';

import { MessageDTO } from '../message/dtos/message.dto';
import { ChatDTO, CreateChatDTO } from './dtos/chat.dto';
import { Chat } from './models/chat.model';
import { ChatRedisRepository } from './repositories/chat-redis.repository';

@Injectable()
export class ChatService {
    constructor(private _chatRepository: ChatRedisRepository) {}

    /**
     * Creates a new chat.
     * @param {CreateChatDTO} createChatDTO - Chat data to create.
     * @return {Chat} - Created entity.
     */
    async createChat(createChatDTO: CreateChatDTO): Promise<Chat> {
        return await this._chatRepository.createChat(createChatDTO);
    }

    /**
     * Accepts a chat request.
     * @param {string} chatId - Chat Id.
     * @return {ChatDTO} - Accepted chat.
     */
    async acceptChatRequest(chatId: string): Promise<ChatDTO> {
        return await this._chatRepository.acceptChatRequest(chatId);
    }

    /**
     * Gets chats using pagination.
     * @param {Object} obj - Object.
     * @param {number} obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 25.
     * @return {ChatDTO[]} - Found chats.
     */
    async getChats({ offset = 0, count = 25 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        return await this._chatRepository.getChats({ offset, count });
    }

    /**
     * Gets accepted chats using pagination.
     * @param {Object} obj - Object.
     * @param {number }obj.offset - Chat offset, defaults to 0.
     * @param {number} obj.count - Amount of chats to fetch, defaults to 25.
     * @return {Chat[]} - Found chats.
     */
    async getAcceptedChats({ offset = 0, count = 25 }: { offset?: number; count?: number } = {}): Promise<ChatDTO[]> {
        return await this._chatRepository.getAcceptedChats({ offset, count });
    }

    /**
     * Gets a chat by its ID.
     * @param {string} chatId - Chat ID.
     * @return {Chat} - Found chat.
     */
    async getChat(chatId: string): Promise<Chat> {
        return await this._chatRepository.getChat(chatId);
    }

    /**
     * Gets messages from a chat by given chat Id.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to get messages from.
     * @param {string|null} obj.from - Optional from sender.
     * @param {number|null} obj.page - Optional page parameter.
     * @param {number} obj.limit - Limit, defaults to 50.
     */
    async getChatMessages({
        chatId,
        from,
        page,
        limit,
    }: {
        chatId: string;
        from: string | null;
        page: number | null;
        limit: number;
    }): Promise<{ hasMore: boolean; messages: MessageDTO<unknown>[] }> {
        return await this._chatRepository.getChatMessages({ chatId, from, page, limit });
    }

    /**
     * Deletes a chat by its ID.
     * @param {string} chatId - Chat ID.
     */
    async deleteChat(chatId: string): Promise<void> {
        return await this._chatRepository.deleteChat(chatId);
    }

    /**
     * Adds a message to a chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to add messages to.
     * @param {Message} obj.message - Signed message to add to chat.
     * @return {string} - Chat entity ID.
     */
    async addMessageToChat({ chat, message }: { chat: Chat; message: MessageDTO<unknown> }): Promise<string> {
        return await this._chatRepository.addMessageToChat({ chat, message });
    }

    /**
     * Removes a contact from a chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to remove contact from.
     * @param {string} obj.contactId - Contact to remove.
     */
    async removeContactFromChat({ chat, contactId }: { chat: Chat; contactId: string }) {
        return await this._chatRepository.removeContactFromChat({ chat, contactId });
    }

    /**
     * Handles a message read.
     * @param {MessateDTO} message - Message that is read.
     */
    async handleMessageRead(message: MessageDTO<string>) {
        return await this._chatRepository.handleMessageRead(message);
    }

    /**
     * Get the group chat of the admin to sync it with new contacts in chat.
     * @param {Object} obj - Object.
     * @param {string} obj.adminLocation - External admin location to get chat from.
     * @param {string} obj.chatId - Chat ID to fetch from location.
     */
    async syncNewChatWithAdmin({ adminLocation, chatId }: { adminLocation: string; chatId: string }): Promise<Chat> {
        return await this._chatRepository.syncNewChatWithAdmin({ adminLocation, chatId });
    }

    /**
     * Send a message to all contacts of a group chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat to send message to.
     * @param {MessageDTO} obj.message - Message to send.
     */
    async handleGroupAdmin({ chat, message }: { chat: Chat; message: MessageDTO<unknown> }) {
        await this._chatRepository.handleGroupAdmin({ chat, message });
    }
}
