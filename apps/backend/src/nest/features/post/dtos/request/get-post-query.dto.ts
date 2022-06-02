import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPostQueryDto {
    @IsOptional()
    @IsNotEmpty()
    owner?: string;

    @IsNotEmpty()
    postId: string;
}
