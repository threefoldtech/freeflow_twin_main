import { EntityData } from 'redis-om';

export interface IStatus extends EntityData {
    avatar: string;
    isOnline: boolean;
}

export interface IStatusUpdate extends EntityData {
    id: string;
    isOnline: boolean;
}
