import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Chat } from '../chat/models/chat.model';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { KeyService } from '../key/key.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { Message } from './models/message.model';
import { MessageRedisRepository } from './repositories/message-redis.repository';

@Injectable()
export class MessageService {
    constructor(
        private readonly _messageRepo: MessageRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService
    ) {}

    /**
     * Creates a new message.
     * @param {CreateMessageDTO} createMessageDTO - CreateMessageDTO.
     * @return {Message} - Created message.
     */
    async createMessage<T>(createMessageDTO: CreateMessageDTO<T>): Promise<Message> {
        try {
            return await this._messageRepo.createMessage(createMessageDTO);
        } catch (error) {
            throw new BadRequestException(`unable to create message: ${error}`);
        }
    }

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
