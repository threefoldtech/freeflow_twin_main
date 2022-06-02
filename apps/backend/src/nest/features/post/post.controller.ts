import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IPostComment, IPostContainerDTO } from 'custom-types/post.type';

import { AuthGuard } from '../../guards/auth.guard';
import { CreatePostDTO } from './dtos/request/create-post.dto';
import { GetPostQueryDto } from './dtos/request/get-post-query.dto';
import { GetPostsQueryDto } from './dtos/request/get-posts-query.dto';
import { LikePostDTO } from './dtos/request/like-post.dto';
import { TypingDTO } from './dtos/request/typing.dto';
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
        return await this._postService.getPosts({ offset, count, username });
    }

    @Get('/:owner/:postId')
    @UseGuards(AuthGuard)
    async getPost(@Param() { owner, postId }: GetPostQueryDto): Promise<IPostContainerDTO> {
        return await this._postService.getPost({ ownerLocation: owner, postId });
    }

    @Post()
    @UseGuards(AuthGuard)
    async createPost(@Body() createPostDTO: CreatePostDTO): Promise<IPostContainerDTO> {
        return await this._postService.createPost(createPostDTO);
    }

    @Delete(':postId')
    @UseGuards(AuthGuard)
    async deletePost(@Param() { postId }: GetPostQueryDto): Promise<string> {
        return await this._postService.deletePost({ postId });
    }

    @Put('like/:postId')
    @UseGuards(AuthGuard)
    async likePost(
        @Param() { postId }: GetPostQueryDto,
        @Body() likePostDTO: LikePostDTO
    ): Promise<{ status: string }> {
        return await this._postService.likePost({ postId, likePostDTO });
    }

    @Put('typing')
    @UseGuards(AuthGuard)
    async handleTyping(@Body() typingDTO: TypingDTO): Promise<{ post: string; user: string }> {
        return await this._postService.handleTyping(typingDTO);
    }

    @Post('someone-is-typing')
    @UseGuards(AuthGuard)
    async handleSendSomeoneIsTyping(@Body() typingDTO: TypingDTO): Promise<boolean> {
        return await this._postService.handleSendSomeoneIsTyping(typingDTO);
    }

    @Put('comment/:postId')
    @UseGuards(AuthGuard)
    async commentOnPost(
        @Param() { postId }: GetPostQueryDto,
        @Body() commentDTO: IPostComment
    ): Promise<{ status: string }> {
        return await this._postService.commentOnPost({ postId, commentDTO });
    }
}
