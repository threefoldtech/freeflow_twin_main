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
     * @param {string} obj.ownerId - Post owner Id for searching.
     * @param {string} obj.replies - Post replies.
     * @return {Post} - Created post.
     */
    async createPost({ id, post, owner, ownerId, images, video }: IPostContainerDTO): Promise<Post> {
        return await this.save({
            id,
            post: stringifyPost(post),
            owner: stringifyPostOwner(owner),
            ownerId,
            images,
            video,
            replies: [],
            likes: [],
        });
    }

    /**
     * Gets posts using pagination.
     * @param {Object} obj - Object.
     * @param {string} obj.offset - Pagination offset.
     * @param {string} obj.count - Pagination count.
     * @return {Post[]} - Found posts.
     */
    async getPosts({ offset, count, username }: { offset: number; count: number; username: string }): Promise<Post[]> {
        return await this.findAllWhereEqPaginated({ offset, count, where: 'ownerId', eq: username });
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
