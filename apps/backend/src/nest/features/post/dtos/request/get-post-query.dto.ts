import { IsNotEmpty } from 'class-validator';

export class GetPostQueryDto {
    @IsNotEmpty()
    owner: string;

    @IsNotEmpty()
    postId: string;
}
