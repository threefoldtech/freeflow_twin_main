import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PathInfoDTO {
    isFile: boolean;
    isDirectory: boolean;
    directory: string;
    path: string;
    fullName: string;
    name: string;
    size: number;
    extension: string;
    createdOn: Date;
    lastModified: Date;
    lastAccessed: Date;
}

export class CreatePathInfoDTO {
    @IsBoolean()
    isFile: boolean;

    @IsBoolean()
    isDirectory: boolean;

    @IsString()
    directory: string;

    @IsString()
    path: string;

    @IsString()
    fullName: string;

    @IsString()
    name: string;

    @IsNumber()
    size: number;

    @IsString()
    extension: string;

    @IsNotEmpty()
    createdOn: Date;

    @IsNotEmpty()
    lastModified: Date;

    @IsNotEmpty()
    lastAccessed: Date;
}
