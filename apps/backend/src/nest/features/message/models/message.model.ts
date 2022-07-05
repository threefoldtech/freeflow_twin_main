import { Entity, Schema } from 'redis-om';

import { MessageType } from '../../../types/message-types';
import { MessageDTO } from '../dtos/message.dto';

export interface Message {
    id: string;
    chatId: string;
    from: string;
    to: string;
    body: string;
    timeStamp: Date;
    type: MessageType;
    subject: string;
    signatures: string[];
    replies: Message[];
}

export class Message extends Entity {
    toJSON(): MessageDTO<unknown> {
        return {
            id: this.id,
            chatId: this.chatId,
            from: this.from,
            to: this.to,
            body: this.parseMessageBody(this.body),
            timeStamp: this.timeStamp,
            type: this.type,
            subject: this.subject,
            signatures: this.signatures,
            replies: this.replies,
        };
    }

    /**
     * Parses message body strings to valid JSON.
     */
    parseMessageBody(body: string): unknown {
        try {
            body = JSON.parse(body);
        } catch (error) {
            return body;
        }
        return body;
    }
}

/**
 * Stringifies the message JSON to a string for Redis.
 * @return {string} - The stringified message.
 */
export function stringifyMessage(message: MessageDTO<unknown>): string {
    return JSON.stringify(message);
}

/**
 * Stringifies the replies JSON to a string for Redis.
 * @return {string} - The stringified replies.
 */
export function stringifyReplies(replies: MessageDTO<unknown>[]): string[] {
    return replies.map(reply => JSON.stringify(reply));
}

/**
 * Stringifies the message body JSON to a string for Redis.
 * @return {string} - The stringified message body.
 */
export function stringifyMessageBody<T>(body: T): string {
    return JSON.stringify(body);
}

export const messageSchema = new Schema(Message, {
    id: { type: 'string' },
    chatId: { type: 'string' },
    from: { type: 'string' },
    to: { type: 'string' },
    body: { type: 'text' },
    timeStamp: { type: 'date' },
    type: { type: 'string' },
    subject: { type: 'string' },
    signatures: { type: 'string[]' },
    replies: { type: 'string[]' },
});
