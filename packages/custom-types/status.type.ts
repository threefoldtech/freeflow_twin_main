import { EntityData } from 'redis-om';

export interface Status extends EntityData {
    avatar: string;
    isOnline: boolean;
}

export interface StatusUpdate extends EntityData {
    id: string;
    isOnline: boolean;
}
