import { Entity, Schema } from 'redis-om';

export interface Contact {
    id: string;
    location: string;
    contactRequest: boolean;
}

export class Contact extends Entity {}

export const contactSchema = new Schema(Contact, {
    id: { type: 'string' },
    location: { type: 'string' },
    contactRequest: { type: 'boolean' },
});
