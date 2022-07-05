import { Entity, Schema } from 'redis-om';

import { ContactDTO } from '../../contact/dtos/contact.dto';
import { IFileShare } from '../interfaces/file-share.interface';
import { ISharePermission } from '../interfaces/share-permission.interface';

export interface Share {
    id?: string;
    path: string;
    owner: string;
    name?: string | undefined;
    isFolder: boolean;
    isSharedWithMe: boolean;
    size?: number | undefined;
    lastModified?: number | undefined;
    permissions: string[];
}

export class Share extends Entity {
    toJSON(): IFileShare {
        return {
            id: this.id,
            path: this.path,
            owner: this.parseOwner(),
            name: this.name,
            isFolder: this.isFolder,
            isSharedWithMe: this.isSharedWithMe,
            size: this.size,
            lastModified: this.lastModified,
            permissions: this.parsePermissions(),
        };
    }

    parseOwner(): ContactDTO {
        return JSON.parse(this.owner);
    }

    parsePermissions(): ISharePermission[] {
        return this.permissions.map(permission => JSON.parse(permission));
    }
}

export const stringifyOwner = (owner: ContactDTO): string => JSON.stringify(owner);

export const stringifyPermissions = (permissions: ISharePermission[]): string[] =>
    permissions.map(permission => JSON.stringify(permission));

export const shareSchema = new Schema(Share, {
    id: { type: 'string' },
    path: { type: 'string' },
    owner: { type: 'string' },
    name: { type: 'string' },
    isFolder: { type: 'boolean' },
    isSharedWithMe: { type: 'boolean' },
    size: { type: 'number' },
    lastModified: { type: 'number' },
    permissions: { type: 'string[]' },
});
