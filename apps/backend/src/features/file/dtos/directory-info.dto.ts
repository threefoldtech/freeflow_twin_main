import { IsBoolean, IsString } from 'class-validator';

export class DirectoryInfoDTO {
    @IsBoolean()
    isFile: boolean;

    @IsBoolean()
    isDirectory: boolean;

    @IsString()
    name: string;
}
