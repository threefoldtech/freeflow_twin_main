import { Entity, Schema } from 'redis-om';

export interface Key {
    userId: string;
    key: string;
    keyType: KeyType;
}

export class Key extends Entity {}

export const keySchema = new Schema(Key, {
    userId: { type: 'string' },
    key: { type: 'string' },
    keyType: { type: 'string' },
});

export enum KeyType {
    Public = 'publicKey',
    Private = 'privateKey',
    Secret = 'secretKey',
}
