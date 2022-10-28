import { IsArray, IsBooleanString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ROLES } from '../../../types/message-types';
import { CreateMessageDTO } from '../../message/dtos/message.dto';

export class ContactDTO {
    @IsString()
    id: string;

    @IsString()
    location: string;

    @IsOptional()
    @IsArray()
    roles?: ROLES[];
}

export class DeleteContactDTO {
    @IsString()
    id: string;
}

export class UpdateContactDTO extends DeleteContactDTO {
    @IsOptional()
    @IsBooleanString()
    contactRequest?: boolean;

    @IsOptional()
    @IsBooleanString()
    accepted?: boolean;

    @IsOptional()
    @IsBooleanString()
    containerOffline?: boolean;
}

export class CreateContactDTO<T> extends UpdateContactDTO {
    @IsString()
    location: string;

    @IsNotEmpty()
    message?: CreateMessageDTO<T>;
}
