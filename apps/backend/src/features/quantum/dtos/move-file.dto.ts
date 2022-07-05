import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class MoveFileDTO {
    @IsArray()
    @ArrayMinSize(1)
    paths: string[];

    @IsString()
    destination: string;
}
