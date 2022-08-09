import { ArrayMaxSize, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IPostComment, PostType } from 'custom-types/post.type';

export class CreatePostDTO {
    @IsString()
    id: string;

    @IsString()
    @MaxLength(2000)
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
    @ArrayMaxSize(10)
    images?: string[];

    @IsOptional()
    video?: string;
}
