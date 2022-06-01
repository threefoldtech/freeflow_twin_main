import { Body, Controller, Post } from '@nestjs/common';
import { IPostDTO } from 'custom-types/post.type';

import { PostService } from './post.service';

@Controller()
export class PostController {
    constructor(public readonly _postService: PostService) {}

    @Post()
    async createPost(@Body() postDTO: IPostDTO) {
        return await this._postService.createPost(postDTO);
    }
}
