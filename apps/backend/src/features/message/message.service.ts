import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IFileShareMessage, MessageType } from '../../types/message-types';
import { Chat } from '../chat/models/chat.model';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { KeyService } from '../key/key.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { Message } from './models/message.model';
import { MessageRedisRepository } from './repositories/message-redis.repository';

@Injectable()
export class MessageService {
    private userId: string;

    constructor(
        private readonly _messageRepo: MessageRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService
    ) {
        this.userId = this._configService.get<string>('userId');
    }

    /**
     * Creates a new message.
     * @param {CreateMessageDTO} createMessageDTO - CreateMessageDTO.
     * @return {Message} - Created message.
     */
    async createMessage<T>(createMessageDTO: CreateMessageDTO<T>): Promise<Message> {
        try {
            console.log(createMessageDTO.timeStamp);
            const existingMessage = await this._messageRepo.findMessageById(createMessageDTO.id);
            if (existingMessage) return;
            return await this._messageRepo.createMessage(createMessageDTO);
        } catch (error) {
            throw new BadRequestException(`unable to create message: ${error}`);
        }
    }

    /**
     * Gets messages from given chat Id using pagination.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to get messages from.
     * @param {number} obj.offset - Pagination offset.
     * @param {number} obj.count - Pagination count.
     */
    async getMessagesFromChat({
        chatId,
        offset,
        count,
    }: {
        chatId: string;
        offset: number;
        count: number;
    }): Promise<MessageDTO<unknown>[]> {
        try {
            return (await this._messageRepo.getMessagesFromChat({ chatId, offset, count })).map(m => m.toJSON());
        } catch (error) {
            throw new BadRequestException(`unable to fetch messages from chat: ${error}`);
        }
    }

    /**
     * Deletes messages from given chat Id.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to delete messages from.
     */
    async deleteMessagesFromChat({ chatId }: { chatId: string }): Promise<void> {
        try {
            return await this._messageRepo.deleteMessagesFromChat(chatId);
        } catch (error) {
            throw new BadRequestException(`unable to delete messages from chat: ${error}`);
        }
    }

    async deleteMessage({ messageId }: { messageId: string }): Promise<boolean> {
        try {
            return await this._messageRepo.deleteMessage({ id: messageId });
        } catch (error) {
            throw new BadRequestException(`unable to delete message: ${error}`);
        }
    }

    /**
     * Verifies a message's signature.
     * @param {Object} obj - Object.
     * @param {boolean} obj.isGroup - Is group chat or not.
     * @param {Contact} obj.admin - Admin contact.
     * @param {Contact} obj.from - From contact.
     * @param {MessageDTO} obj.signedMessage - Signed message to verify.
     * @return {boolean} - Valid signature or not.
     */
    async verifySignedMessage<T>({
        isGroup,
        adminContact,
        fromContact,
        signedMessage,
    }: {
        isGroup: boolean;
        adminContact?: ContactDTO;
        fromContact?: ContactDTO;
        signedMessage: MessageDTO<T>;
    }): Promise<boolean> {
        let signatureIdx = 0;

        if (!fromContact) return false;

        const userID = this._configService.get<string>('userId');
        if (isGroup && adminContact?.id !== userID) {
            const adminVerified = await this._keyService.verifyMessageSignature({
                contact: adminContact,
                message: signedMessage,
                signature: signedMessage.signatures[signatureIdx],
            });
            if (!adminVerified) return false;
            signatureIdx++;
        }

        return await this._keyService.verifyMessageSignature({
            contact: fromContact,
            message: signedMessage,
            signature: signedMessage.signatures[signatureIdx],
        });
    }

    /**
     * Verifies a message's signature by given chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat containing message.
     * @param {MessageDTO} obj.signedMessage - Signed message to verify.
     * @return {boolean} - Valid signature or not.
     */
    async verifySignedMessageByChat<T>({
        chat,
        signedMessage,
    }: {
        chat: Chat;
        signedMessage: MessageDTO<T>;
    }): Promise<boolean> {
        const contacts = chat.parseContacts();
        const adminContact = contacts.find(c => c.id === chat.adminId);
        const fromContact = contacts.find(c => c.id === signedMessage.from);
        return this.verifySignedMessage({ isGroup: chat.isGroup, adminContact, fromContact, signedMessage });
    }

    async getAllMessagesFromChat({ chatId }: { chatId: string }): Promise<Message[]> {
        try {
            return await this._messageRepo.getAllMessagesFromChat({ chatId });
        } catch (error) {
            return [];
        }
    }

    async editMessage({ messageId, text }: { messageId: string; text: string }) {
        try {
            const message = await this._messageRepo.findMessageById(messageId);
            message.body = JSON.stringify(text);
            await this._messageRepo.updateMessage({ message });
            return message.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to edit message: ${error}`);
        }
    }

    async renameSharedMessage({ message, chatId }: { message: MessageDTO<IFileShareMessage>; chatId: string }) {
        const msgReferences = (await this.getAllMessagesFromChat({ chatId }))
            .filter(msg => msg.type === MessageType.FILE_SHARE)
            .filter(msg => (JSON.parse(msg.body) as IFileShareMessage).id === message.body.id);
        Promise.all(
            msgReferences.map(async message => {
                message.body = JSON.stringify(message.body);
                await this._messageRepo.updateMessage({
                    message,
                });
            })
        );
    }

    /**
     * Determines chat ID for given message.
     * @param {MessageDTO} message - Message to determine chat ID from.
     * @return {string} - Chat ID.
     */
    determineChatID<T>({ to, from }: MessageDTO<T>): string {
        if (to === this._configService.get<string>('userId')) return from;
        return to;
    }

    
}
