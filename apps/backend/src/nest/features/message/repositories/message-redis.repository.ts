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

    async getMessagesFromChat({
        chatId,
        offset,
        count,
    }: {
        chatId: string;
        offset: number;
        count: number;
    }): Promise<Message[]> {
        return await this.findAllWhereEq({ offset, count, where: 'chatId', eq: chatId });
    }
}
