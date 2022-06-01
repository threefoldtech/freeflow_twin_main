import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostContainerDTO, IPostDTO, IPostOwner } from 'custom-types';

import { LocationService } from '../location/location.service';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Injectable()
export class PostService {
    private _postRepo: PostRedisRepository;

    private ownLocation = '';

    constructor(private readonly _locationService: LocationService, private readonly _configService: ConfigService) {}

    async createPost(createPostDTO: IPostDTO) {
        const { id, body, createdOn, lastModified, isGroupPost, type, images } = createPostDTO;
        try {
            if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;
            const postDTO: IPostDTO = {
                id,
                body,
                createdOn,
                lastModified,
                isGroupPost,
                type,
                images,
            };
            const postOwner: IPostOwner = {
                id: this._configService.get<string>('userId'),
                location: this.ownLocation,
            };
            const postContainer: IPostContainerDTO = {
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
