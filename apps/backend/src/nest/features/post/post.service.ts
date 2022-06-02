import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostContainerDTO, IPostDTO, IPostOwner } from 'custom-types/post.type';

import { LocationService } from '../location/location.service';
import { CreatePostDTO } from './dtos/create-post.dto';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Injectable()
export class PostService {
    private ownLocation = '';

    constructor(
        private readonly _postRepo: PostRedisRepository,
        private readonly _locationService: LocationService,
        private readonly _configService: ConfigService
    ) {}

    async createPost(createPostDTO: CreatePostDTO) {
        const { id, body, createdOn, lastModified, isGroupPost, type, images, replies, signatures } = createPostDTO;
        try {
            if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;
            const postDTO: IPostDTO = {
                id,
                body,
                createdOn,
                lastModified,
                isGroupPost,
                type,
                images: images || [],
                replies,
                signatures,
            };
            const postOwner: IPostOwner = {
                id: this._configService.get<string>('userId'),
                location: this.ownLocation,
            };
            const postContainer: IPostContainerDTO = {
                post: postDTO,
                owner: postOwner,
                images: images || [],
                replies: [],
                likes: [],
            };
            return (await this._postRepo.createPost(postContainer)).toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to create post: ${error}`);
        }
    }
}
