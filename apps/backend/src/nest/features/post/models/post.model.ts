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

export class Post extends Entity {}

export const postSchema = new Schema(Post, {
    post: { type: 'string' },
    owner: { type: 'string' },
    likes: { type: 'string[]' },
    images: { type: 'string[]' },
    replies: { type: 'string[]' },
    isTyping: { type: 'string[]' },
});
