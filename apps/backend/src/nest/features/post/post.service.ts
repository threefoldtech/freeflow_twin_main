import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePostDTO, PostContainerDTO, PostDTO, PostOwner } from 'custom-types/post.type';

import { LocationService } from '../location/location.service';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Injectable()
export class PostService {
    private _postRepo: PostRedisRepository;

    private ownLocation = '';

    constructor(private readonly _locationService: LocationService, private readonly _configService: ConfigService) {}

    async createPost(createPostDTO: CreatePostDTO) {
        const { id, body, createdOn, lastModified, isGroupPost, type, images } = createPostDTO;
        try {
            if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;
            const postDTO: PostDTO = {
                id,
                body,
                createdOn,
                lastModified,
                isGroupPost,
                type,
                images,
            };
            const postOwner: PostOwner = {
                id: this._configService.get<string>('userId'),
                location: this.ownLocation,
            };
            const postContainer: PostContainerDTO = {
                post: postDTO,
                owner: postOwner,
                images,
                replies: [],
                likes: [],
            };
            return await this._postRepo.createPost(postContainer);
        } catch (error) {
            throw new BadRequestException(`unable to create post: ${error}`);
        }
    }
}
