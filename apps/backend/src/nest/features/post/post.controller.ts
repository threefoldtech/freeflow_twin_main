import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IPostContainerDTO } from 'custom-types/post.type';

import { AuthGuard } from '../../guards/auth.guard';
import { CreatePostDTO } from './dtos/create-post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
    constructor(private readonly _postService: PostService) {}

    @Get(':username')
    @UseGuards(AuthGuard)
    async getPosts(
        @Param('username') username: string,
        @Query('offset') offset = 0,
        @Query('count') count = 50
    ): Promise<IPostContainerDTO[]> {
        return await this._postService.getPosts({ offset, count, username });
    }

    @Post()
    @UseGuards(AuthGuard)
    async createPost(@Body() createPostDTO: CreatePostDTO) {
        return await this._postService.createPost(createPostDTO);
    }
}
