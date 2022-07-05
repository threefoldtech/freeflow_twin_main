import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { ContactDTO } from '../../contact/dtos/contact.dto';
import { ISharePermission } from '../interfaces/share-permission.interface';

export class ShareFileRequesDTO {
    @IsString()
    path: string;

    @IsBoolean()
    isPublic: boolean;

    @IsBoolean()
    isWritable: boolean;

    @IsString()
    userId: string;

    @IsString()
    filename: string;
}

export class CreateFileShareDTO {
    @IsOptional()
    @IsString()
    id?: string;

    @IsString()
    path: string;

    @IsNotEmpty()
    owner: ContactDTO;

    @IsOptional()
    @IsString()
    name?: string | undefined;

    @IsBoolean()
    isFolder: boolean;

    @IsBoolean()
    isSharedWithMe: boolean;

    @IsOptional()
    @IsNumber()
    size?: number | undefined;

    @IsOptional()
    @IsNumber()
    lastModified?: number | undefined;

    @IsArray()
    @ArrayMinSize(1)
    permissions: ISharePermission[];
}
