import { IPostComment, IPostContainerDTO, IPostDTO, IPostLike, IPostOwner } from 'custom-types/post.type';
import { Entity, Schema } from 'redis-om';

/**
 * Every model with string[] will later be parsed to the correct model type.
 * string[] is needed for Redis.
 */
export interface Post {
    post: string;
    owner: string;
    likes: string[];
    images: string[];
    replies: string[];
    isTyping?: string[];
}

export class Post extends Entity {
    toJSON(): IPostContainerDTO {
        return {
            post: this.parsePost(),
            owner: this.parsePostOwner(),
            likes: this.parseLikes(),
            images: this.images,
            replies: this.parseReplies(),
            isTyping: this.isTyping,
        };
    }

    parsePost(): IPostDTO {
        return JSON.parse(this.post);
    }

    parsePostOwner(): IPostOwner {
        return JSON.parse(this.owner);
    }

    parseLikes(): IPostLike[] {
        return this.likes.map(l => JSON.parse(l));
    }

    parseReplies(): IPostComment[] {
        return this.replies.map(r => JSON.parse(r));
    }
}

/**
 * Stringifies post JSON to a string for Redis.
 * @param {PostDTO} post - Post to stringify.
 * @return {string} - The stringified post.
 */
export const stringifyPost = (post: IPostDTO): string => JSON.stringify(post);

/**
 * Stringifies PostOwner JSON to a string for Redis.
 * @param {PostOwner} postOwner - Post owner to stringify.
 * @return {string} - The stringified post owner.
 */
export const stringifyPostOwner = (postOwner: IPostOwner): string => JSON.stringify(postOwner);

/**
 * Stringifies likes JSON to a string for Redis.
 * @param {PostLike[]} likes - Post likes to stringify.
 * @return {string[]} - The stringified likes.
 */
export const stringifyLikes = (likes: IPostLike[]): string[] => likes.map(like => JSON.stringify(like));

/**
 * Stringifies replies JSON to a string for Redis.
 * @param {PostComment[]} replies - Post replies to stringify.
 * @return {string[]} - The stringified replies.
 */
export const stringifyReplies = (replies: IPostComment[]): string[] => replies.map(reply => JSON.stringify(reply));

export const postSchema = new Schema(Post, {
    post: { type: 'string' },
    owner: { type: 'string' },
    likes: { type: 'string[]' },
    images: { type: 'string[]' },
    replies: { type: 'string[]' },
    isTyping: { type: 'string[]' },
});
