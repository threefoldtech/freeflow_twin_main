import { IsString } from 'class-validator';

export class TypingDTO {
    @IsString()
    location: string;

    @IsString()
    postId: string;

    @IsString()
    userId: string;
}
