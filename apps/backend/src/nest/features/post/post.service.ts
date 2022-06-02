import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostContainerDTO, IPostDTO, IPostOwner } from 'custom-types/post.type';

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
                id,
                post: postDTO,
                owner: postOwner,
                ownerId: postOwner.id,
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
            return (await this._postRepo.getPosts({ offset, count, username })).map(post => post.toJSON());
        } catch (error) {
            return [];
        }
    }

    async getPost({ postId }: { postId: string }): Promise<IPostContainerDTO> {
        try {
            return (await this._postRepo.getPost({ id: postId })).toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to get post: ${error}`);
        }
    }

    async likePost({ postId, likePostDTO }: { postId: string; likePostDTO: LikePostDTO }) {
        const { likerId, likerLocation } = likePostDTO;
        const post = await this._postRepo.getPost({ id: postId });
        const likes = post.parseLikes();
        likes.push({ id: likerId, location: likerLocation });
        post.likes = stringifyLikes(likes);
        try {
            await this._postRepo.updatePost(post);
            return post.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to like post: ${error}`);
        }
    }
}
