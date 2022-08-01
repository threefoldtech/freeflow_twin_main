import { Entity, Schema } from 'redis-om';

import { ContactDTO } from '../../contact/dtos/contact.dto';
import { Contact } from '../../contact/models/contact.model';
import { MessageDTO } from '../../message/dtos/message.dto';
import { Message } from '../../message/models/message.model';
import { ChatDTO, IRead } from '../dtos/chat.dto';

/**
 * Every model with string[] will later be parsed to the correct model type.
 * string[] is needed for Redis.
 */
export interface Chat {
    chatId: string;
    name: string;
    contacts: string[];
    acceptedChat: boolean;
    adminId: string;
    read: string[];
    isGroup: boolean;
    draft?: string;
}

export class Chat extends Entity {
    toJSON(): ChatDTO {
        return {
            chatId: this.chatId,
            name: this.name,
            contacts: this.parseContacts(),
            read: this.parseRead(),
            acceptedChat: this.acceptedChat,
            adminId: this.adminId,
            isGroup: this.isGroup,
            draft: this.parseMessage(),
            messages: [],
        };
    }

    /**
     * Parses message or draft strings to valid JSON.
     * @return {Message} - The parsed message.
     */
    parseMessage(): Message {
        return JSON.parse(this.draft);
    }

    /**
     * Parses contact strings to valid JSON.
     * @return {Contact[]} - The parsed contacts.
     */
    parseContacts(): Contact[] {
        return this.contacts.map(contact => JSON.parse(contact));
    }

    /**
     * Parses read strings to valid JSON.
     * @return {IRead[]} - The parsed reads.
     */
    parseRead(): IRead[] {
        return this.read.map(read => JSON.parse(read));
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

/**
 * Stringifies reads JSON to a string for Redis.
 * @return {string[]} - The stringified reads.
 */
export function stringifyRead(read: IRead[]): string[] {
    return read.map(r => JSON.stringify(r));
}

export const chatSchema = new Schema(Chat, {
    chatId: { type: 'string' },
    name: { type: 'string' },
    contacts: { type: 'string[]' },
    acceptedChat: { type: 'boolean' },
    adminId: { type: 'string' },
    read: { type: 'string[]' },
    isGroup: { type: 'boolean' },
    draft: { type: 'string' },
});
