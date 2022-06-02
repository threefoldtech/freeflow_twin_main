import { IsNotEmpty } from 'class-validator';

export class LikePostQueryDTO {
    @IsNotEmpty()
    postId: string;
}
