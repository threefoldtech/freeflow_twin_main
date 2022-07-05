import { IsNotEmpty } from 'class-validator';

export class GetPostsQueryDto {
    @IsNotEmpty()
    username: string;
}
