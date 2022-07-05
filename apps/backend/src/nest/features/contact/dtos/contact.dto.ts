import { IsBooleanString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CreateMessageDTO } from '../../message/dtos/message.dto';

export class ContactDTO {
    @IsString()
    id: string;

    @IsString()
    location: string;
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
}

export class CreateContactDTO<T> extends UpdateContactDTO {
    @IsString()
    location: string;

    @IsNotEmpty()
    message?: CreateMessageDTO<T>;
}
