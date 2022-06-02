import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostContainerDTO } from 'custom-types/post.type';

import { ApiService } from '../api/api.service';
import { LocationService } from '../location/location.service';
import { CreatePostDTO } from './dtos/request/create-post.dto';
import { LikePostDTO } from './dtos/request/like-post.dto';
import { stringifyLikes } from './models/post.model';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Injectable()
export class PostService {
    private ownLocation = '';

    constructor(
        private readonly _postRepo: PostRedisRepository,
        private readonly _locationService: LocationService,
        private readonly _configService: ConfigService,
        private readonly _apiService: ApiService
    ) {}

    async createPost({
        id,
        body,
        createdOn,
        lastModified,
        isGroupPost,
        type,
        images,
        replies,
        signatures,
    }: CreatePostDTO) {
        if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;
        const userId = this._configService.get<string>('userId');
        try {
            const postContainer: IPostContainerDTO = {
                id,
                post: {
                    id,
                    body,
                    createdOn,
                    lastModified,
                    isGroupPost,
                    type,
                    images: images || [],
                    replies,
                    signatures,
                },
                owner: {
                    id: userId,
                    location: this.ownLocation,
                },
                ownerId: userId,
                images: images || [],
                replies,
                likes: [],
            };
            return (await this._postRepo.createPost(postContainer)).toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to create post: ${error}`);
        }
    }

    async getPosts({
        offset,
        count,
        username,
    }: {
        offset: number;
        count: number;
        username: string;
    }): Promise<IPostContainerDTO[]> {
        try {
            if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;
            return (await this._postRepo.getPosts({ offset, count, username })).map(post => post.toJSON());
        } catch (error) {
            return [];
        }
    }

    async getPost({ ownerLocation, postId }: { ownerLocation: string; postId: string }): Promise<IPostContainerDTO> {
        if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;

        if (ownerLocation === this.ownLocation)
            try {
                return (await this._postRepo.getPost({ id: postId })).toJSON();
            } catch (error) {
                throw new BadRequestException(`unable to get post: ${error}`);
            }

        return await this._apiService.getExternalPost({ location: ownerLocation, postId });
    }

    async likePost({ postId, likePostDTO }: { postId: string; likePostDTO: LikePostDTO }) {
        const { likerId: id, likerLocation: location } = likePostDTO;
        const post = await this._postRepo.getPost({ id: postId });
        const likes = post.parseLikes();
        likes.push({ id, location });
        post.likes = stringifyLikes(likes);
        try {
            await this._postRepo.updatePost(post);
            return post.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to like post: ${error}`);
        }
    }
}
