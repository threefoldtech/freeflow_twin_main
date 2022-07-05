import { IsString } from 'class-validator';

export class LikePostDTO {
    @IsString()
    likerId: string;

    @IsString()
    likerLocation: string;

    @IsString()
    owner: string;
}
