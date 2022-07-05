import { IsString } from 'class-validator';

export class CreateBlockedContactDTO {
    @IsString()
    id: string;
}

export class DeleteBlockedContactDTO {
    @IsString()
    id: string;
}
