import { Body, Controller, Get, Post } from '@nestjs/common';
import { IPostDTO } from 'custom-types/post.type';

import { CreatePostDTO } from './dtos/create-post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
    constructor(private readonly _postService: PostService) {}

    @Get(':username')
    getPosts(): IPostDTO[] {
        return [];
    }

    @Post()
    async createPost(@Body() createPostDTO: CreatePostDTO) {
        return await this._postService.createPost(createPostDTO);
    }
}
