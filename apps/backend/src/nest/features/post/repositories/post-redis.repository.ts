import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { Post, postSchema } from '../models/post.model';

@Injectable()
export class PostRedisRepository extends EntityRepository<Post> {
    constructor(readonly dbService: DbService) {
        super(dbService, postSchema);
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
