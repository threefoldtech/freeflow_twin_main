import { Body, Controller, Post } from '@nestjs/common';
import { CreatePostDTO } from 'types/post.type';

import { PostService } from './post.service';

@Controller()
export class PostController {
    constructor(public readonly _postService: PostService) {}

    @Post()
    async createPost(@Body() createPostDTO: CreatePostDTO) {
        return await this._postService.createPost(createPostDTO);
    }
}
