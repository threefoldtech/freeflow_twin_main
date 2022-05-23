import { IsNotEmpty, IsString } from 'class-validator';

import { CreateMessageDTO } from '../../message/dtos/message.dto';

export class ContactDTO {
    @IsString()
    id: string;

    @IsString()
    location: string;
}

export class CreateContactDTO<T> {
    @IsString()
    id: string;

    @IsString()
    location: string;

    contactRequest: boolean;

    @IsNotEmpty()
    message?: CreateMessageDTO<T>;
}

export class DeleteContactDTO {
    @IsString()
    id: string;
}
