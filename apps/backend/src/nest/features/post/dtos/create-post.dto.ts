import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IPostComment, PostType } from 'custom-types/post.type';

export class CreatePostDTO {
    @IsString()
    id: string;

    @IsString()
    body: string;

    @IsNotEmpty()
    createdOn: Date;

    @IsNotEmpty()
    lastModified: Date;

    @IsBoolean()
    isGroupPost: boolean;

    type: PostType;

    @IsOptional()
    replies: IPostComment[];

    @IsString()
    signatures: string;

    @IsOptional()
    images?: string[];
}
