import { ContactDTO } from '../../contact/dtos/contact.dto';
import { ISharePermission } from './share-permission.interface';

export interface IFileShare {
    id?: string;
    path: string;
    owner: ContactDTO;
    name?: string | undefined;
    isFolder: boolean;
    isSharedWithMe: boolean;
    size?: number | undefined;
    lastModified?: number | undefined;
    permissions: ISharePermission[];
}
