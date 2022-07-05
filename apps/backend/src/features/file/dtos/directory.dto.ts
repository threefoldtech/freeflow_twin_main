import { IsString } from 'class-validator';

export class DirectoryDTO {
    name: string;
    path: string;
}

export class CreateDirectoryDTO {
    @IsString()
    name: string;

    @IsString()
    path: string;
}
