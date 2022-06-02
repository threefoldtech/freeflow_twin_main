import { Injectable } from '@nestjs/common';
import { IPostContainerDTO } from 'custom-types/post.type';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { Post, postSchema, stringifyPost, stringifyPostOwner } from '../models/post.model';

@Injectable()
export class PostRedisRepository extends EntityRepository<Post> {
    constructor(readonly dbService: DbService) {
        super(dbService, postSchema);
    }

    /**
     * Create a post.
     * @param {Object} obj - Object.
     * @param {string} obj.post - Post.
     * @param {string} obj.owner - Post owner.
     * @param {string} obj.replies - Post replies.
     * @return {Post} - Created post.
     */
    async createPost({ post, owner, images }: IPostContainerDTO): Promise<Post> {
        return await this.save({
            post: stringifyPost(post),
            owner: stringifyPostOwner(owner),
            images,
            replies: [],
            likes: [],
        });
    }

    /**
     * Gets posts using pagination.
     * @return {Post[]} - Found posts.
     */
    async getPosts({ offset, count }: { offset: number; count: number }): Promise<Post[]> {
        return await this.findAllPaginated({ offset, count });
    }

    /**
     * Get a post by id.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Post Id.
     * @return {Post} - Found post.
     */
    async getPost({ id }: { id: string }): Promise<Post> {
        return await this.findOne({ where: 'id', eq: id });
    }

    /**
     * Updates a post.
     * @param {Post} post - Updated chat.
     * @return {string} - Post Id.
     */
    async updatePost(post: Post): Promise<string> {
        return await this.update(post);
    }

    /**
     * Deletes a post.
     * @param {Object} obj - Object.
     * @param {string} obj.id - Post Id.
     */
    async deletePost({ id }: { id: string }): Promise<void> {
        return await this.delete(id);
    }
}
