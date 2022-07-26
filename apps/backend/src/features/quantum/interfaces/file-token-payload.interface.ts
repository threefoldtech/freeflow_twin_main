import { SharePermissionType } from '../enums/share-permission-type.enum';

export interface IFileTokenPayload {
    file: string;
    permissions: SharePermissionType[];
}
