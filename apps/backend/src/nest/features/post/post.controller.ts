import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IPostContainerDTO } from 'custom-types/post.type';

import { AuthGuard } from '../../guards/auth.guard';
import { CreatePostDTO } from './dtos/request/create-post.dto';
import { GetPostQueryDto } from './dtos/request/get-post-query.dto';
import { GetPostsQueryDto } from './dtos/request/get-posts-query.dto';
import { LikePostDTO } from './dtos/request/like-post.dto';
import { LikePostQueryDTO } from './dtos/request/like-post-query.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
    constructor(private readonly _postService: PostService) {}

    @Get(':username')
    @UseGuards(AuthGuard)
    async getPosts(
        @Param() { username }: GetPostsQueryDto,
        @Query('offset') offset = 0,
        @Query('count') count = 50
    ): Promise<IPostContainerDTO[]> {
        // TODO: get posts from others
        return await this._postService.getPosts({ offset, count, username });
    }

    @Get('/:owner/:postId')
    @UseGuards(AuthGuard)
    async getPost(@Param() { owner, postId }: GetPostQueryDto): Promise<IPostContainerDTO> {
        // TODO: get posts from others
        return await this._postService.getPost({ ownerLocation: owner, postId });
    }

    @Post()
    @UseGuards(AuthGuard)
    async createPost(@Body() createPostDTO: CreatePostDTO): Promise<IPostContainerDTO> {
        // TODO: add validation, handle images
        return await this._postService.createPost(createPostDTO);
    }

    @Put('like/:postId')
    @UseGuards(AuthGuard)
    async likePost(
        @Param() { postId }: LikePostQueryDTO,
        @Body() likePostDTO: LikePostDTO
    ): Promise<IPostContainerDTO> {
        // TODO: handle dislike
        return await this._postService.likePost({ postId, likePostDTO });
    }
}
