import { SharePermissionType } from '../enums/share-permission-type.enum';

export interface ISharePermission {
    userId: string;
    sharePermissionTypes: SharePermissionType[];
}
