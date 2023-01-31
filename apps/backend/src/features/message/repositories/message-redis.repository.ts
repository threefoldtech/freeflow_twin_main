import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { CreateMessageDTO } from '../dtos/message.dto';
import { Message, messageSchema, stringifyMessageBody, stringifyReplies } from '../models/message.model';

@Injectable()
export class MessageRedisRepository extends EntityRepository<Message> {
    constructor(readonly dbService: DbService) {
        super(dbService, messageSchema);
    }

    /**
     * Creates a new message.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Message Id.
     * @param {string} obj.from - Message from.
     * @param {string} obj.to - Message to.
     * @param {string} obj.body - Message body.
     * @param {Date} obj.timeStamp - Message timestamp.
     * @param {string[]} obj.replies - Message replies.
     * @param {string} obj.subject - Message subject.
     * @param {string} obj.type - Message type.
     * @param {string[]} obj.signatures - Message signatures.
     * @return {Message} - Created message.
     */
    async createMessage<T>({
        id,
        chatId,
        from,
        to,
        body,
        timeStamp,
        replies,
        subject,
        type,
        signatures,
    }: CreateMessageDTO<T>): Promise<Message> {
        return await this.save({
            id,
            chatId,
            from,
            to,
            body: stringifyMessageBody(body),
            timeStamp,
            replies: stringifyReplies(replies),
            subject,
            type,
            signatures: signatures ?? null,
        });
    }

    async findMessageById(id: string): Promise<Message> {
        return await this.findOne({ where: 'id', eq: id });
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
    }): Promise<Message[]> {
        const totalMessagesCount = await this.countAllWhereEq({ where: 'chatId', eq: chatId });
        if (offset >= totalMessagesCount) return [];

        offset = totalMessagesCount - count - offset;
        if (offset < 0) {
            count += offset;
            offset = 0;
        }
        return await this.findAllWhereEqPaginated({ offset, count, where: 'chatId', eq: chatId });
    }

    async getAllMessagesCountFromChat(chatId: string): Promise<number> {
        return await this.countAllWhereEq({ where: 'chatId', eq: chatId });
    }

    async getAllMessagesFromChat({ chatId }: { chatId: string }): Promise<Message[]> {
        return await this.findAllWhereEq({ where: 'chatId', eq: chatId });
    }

    async deleteMessagesFromChat(chatId: string) {
        const messages = await this.findAllWhereEq({ where: 'chatId', eq: chatId });
        messages.forEach(m => this.delete(m.entityId));
    }

    async deleteMessage({ id }: { id: string }): Promise<boolean> {
        const message = await this.findOne({ where: 'id', eq: id });
        await this.delete(message.entityId);
        return true;
    }

    async updateMessage({ message }: { message: Message }): Promise<Message> {
        await this.update(message);
        return message;
    }
}
