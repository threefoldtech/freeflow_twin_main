import { IsString } from 'class-validator';

export class RenameFileDTO {
    @IsString()
    from: string;

    @IsString()
    to: string;
}
