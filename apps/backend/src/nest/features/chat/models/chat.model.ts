import { Entity, Schema } from 'redis-om';

import { MessageType } from '../../../types/message-types';
import { ContactDTO } from '../../contact/dtos/contact.dto';
import { Contact } from '../../contact/models/contact.model';
import { MessageDTO } from '../../message/dtos/message.dto';
import { Message } from '../../message/models/message.model';
import { ChatDTO } from '../dtos/chat.dto';

/**
 * Every model with string[] will later be parsed to the correct model type.
 * string[] is needed for Redis.
 */
export interface Chat {
    chatId: string;
    name: string;
    contacts: string[];
    messages: string[];
    acceptedChat: boolean;
    adminId: string;
    read: string[];
    isGroup: boolean;
    draft?: string[];
}

export class Chat extends Entity {
    toJSON(): ChatDTO {
        return {
            chatId: this.chatId,
            name: this.name,
            contacts: this.parseContacts(),
            messages: this.parseMessages(),
            read: this.read,
            acceptedChat: this.acceptedChat,
            adminId: this.adminId,
            isGroup: this.isGroup,
            draft: this.parseMessages(true),
        };
    }
    /**
     * Parses message or draft strings to valid JSON.
     * @param draft - Parse drafts of messages if false. Defaults to false.
     * @return {Message[]} - The parsed messages.
     */
    parseMessages(draft = false): Message[] {
        if (draft && this.draft.length) return this.draft.map(m => JSON.parse(m));

        return this.messages.map(m => JSON.parse(m));
    }

    /**
     * Parses message or draft body strings to valid JSON.
     * @param m - Message
     * @return {Message} - The message with parsed body.
     */
    parseMessageBody(m: string): Message {
        const msg: Message = JSON.parse(m);
        if (msg.type === MessageType.SYSTEM) msg.body = JSON.parse(msg.body);
        return msg;
    }

    /**
     * Parses contact strings to valid JSON.
     * @return {Contact[]} - The parsed contacts.
     */
    parseContacts(): Contact[] {
        return this.contacts.map(contact => JSON.parse(contact));
    }
}

/**
 * Stringifies messages JSON to a string for Redis.
 * @return {string[]} - The stringified messages.
 */
export function stringifyMessages<T>(messages: MessageDTO<T>[]): string[] {
    return messages.map(msg => JSON.stringify(msg));
}

/**
 * Stringifies contacts JSON to a string for Redis.
 * @return {string[]} - The stringified contacts.
 */
export function stringifyContacts(contacts: ContactDTO[]): string[] {
    return contacts.map(contact => JSON.stringify(contact));
}

export const chatSchema = new Schema(Chat, {
    chatId: { type: 'string' },
    name: { type: 'string' },
    contacts: { type: 'string[]' },
    messages: { type: 'string[]' },
    acceptedChat: { type: 'boolean' },
    adminId: { type: 'string' },
    read: { type: 'string[]' },
    isGroup: { type: 'boolean' },
    draft: { type: 'string[]' },
});
