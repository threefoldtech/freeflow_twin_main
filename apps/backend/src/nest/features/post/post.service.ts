import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPostComment, IPostContainerDTO } from 'custom-types/post.type';

import { ApiService } from '../api/api.service';
import { BlockedContactService } from '../blocked-contact/blocked-contact.service';
import { ContactService } from '../contact/contact.service';
import { Contact } from '../contact/models/contact.model';
import { LocationService } from '../location/location.service';
import { UserGateway } from '../user/user.gateway';
import { CreatePostDTO } from './dtos/request/create-post.dto';
import { LikePostDTO } from './dtos/request/like-post.dto';
import { TypingDTO } from './dtos/request/typing.dto';
import { stringifyLikes, stringifyReplies } from './models/post.model';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Injectable()
export class PostService {
    private ownLocation = '';
    private contacts: Contact[] = [];
    private blockedContacts: string[] = [];

    constructor(
        private readonly _postRepo: PostRedisRepository,
        private readonly _locationService: LocationService,
        private readonly _configService: ConfigService,
        private readonly _apiService: ApiService,
        private readonly _contactService: ContactService,
        private readonly _blockedContactService: BlockedContactService,
        private readonly _userGateway: UserGateway
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
        const posts: IPostContainerDTO[] = [];
        try {
            // get contacts posts
            const contacts = await this.getContacts();
            await Promise.all(
                contacts.map(async contact => {
                    const data = await this._apiService.getExternalPosts({
                        location: contact.location,
                        userId: contact.id,
                    });
                    posts.push(...data);
                })
            );

            // get own posts
            const data = (await this._postRepo.getPosts({ offset, count, username })).map(post => post.toJSON());
            posts.push(...data);
        } catch (error) {
            return [];
        }

        return posts;
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

    async likePost({ postId, likePostDTO }: { postId: string; likePostDTO: LikePostDTO }): Promise<{ status: string }> {
        const { likerId: id, likerLocation: location, owner } = likePostDTO;

        if (await this.isBlocked({ userId: id })) throw new BadRequestException('blocked');

        if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;

        if (owner !== this.ownLocation)
            return await this._apiService.likeExternalPost({ location: owner, likePostDTO, postId });

        const post = await this._postRepo.getPost({ id: postId });
        const likes = post.parseLikes();

        const res = {
            status: likes.some(l => l.location === location && l.id === id) ? 'unliked' : 'liked',
        };

        if (res.status == 'unliked') likes.splice(likes.indexOf({ id, location }), 1);
        else likes.push({ id, location });

        post.likes = stringifyLikes(likes);
        try {
            await this._postRepo.updatePost(post);
            return res;
        } catch (error) {
            throw new BadRequestException(`unable to like post: ${error}`);
        }
    }

    async deletePost({ postId }: { postId: string }): Promise<string> {
        try {
            const post = await this._postRepo.getPost({ id: postId });
            if (post.ownerId !== this._configService.get<string>('userId'))
                throw new ForbiddenException("cannot delete someone else's post");
            await this._postRepo.deletePost({ id: post.entityId });
            return postId;
        } catch (error) {
            throw new BadRequestException(`unable to delete post: ${error}`);
        }
    }

    async handleTyping(typingDTO: TypingDTO): Promise<{ post: string; user: string }> {
        const { location, postId, userId } = typingDTO;

        if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;

        if (location !== this.ownLocation) return this._apiService.handleTyping({ location, typingDTO });

        const contacts = await this.getContacts();
        Promise.all(
            contacts.map(async contact => {
                await this._apiService.sendSomeoneIsTyping({ location: contact.location, typingDTO });
            })
        );

        return { post: postId, user: userId };
    }

    async handleSendSomeoneIsTyping(typingDTO: TypingDTO): Promise<boolean> {
        const { postId, userId } = typingDTO;
        this._userGateway.emitMessageToConnectedClients('post_typing', { post: postId, user: userId });
        return true;
    }

    async commentOnPost({
        postId,
        commentDTO,
    }: {
        postId: string;
        commentDTO: IPostComment;
    }): Promise<{ status: string }> {
        const { post, replyTo, isReplyToComment } = commentDTO;

        if (!this.ownLocation) this.ownLocation = (await this._locationService.getOwnLocation()) as string;

        if (post.owner.location !== this.ownLocation)
            return await this._apiService.commentOnExternalPost({ location: post.owner.location, commentDTO });

        try {
            const dbPost = await this._postRepo.getPost({ id: postId });
            const comments = dbPost.parseReplies();
            if (isReplyToComment) {
                const commentIdx = comments.findIndex(r => r.id === replyTo);
                if (commentIdx < 0) throw new BadRequestException('comment not found');
                comments[commentIdx].replies.push(commentDTO);
            } else comments.push(commentDTO);
            dbPost.replies = stringifyReplies(comments);
            await this._postRepo.updatePost(dbPost);
        } catch (error) {
            throw new BadRequestException(`unable to comment on post: ${error}`);
        }

        return { status: 'commented' };
    }

    /**
     * Gets all contacts that are not blocked.
     * @return {Contact[]} - Contacts.
     */
    private async getContacts(): Promise<Contact[]> {
        if (!this.contacts) this.contacts = await this._contactService.getContacts();
        if (!this.blockedContacts) this.blockedContacts = await this._blockedContactService.getBlockedContactList();

        return this.contacts.filter(contact => !this.blockedContacts.includes(contact.id));
    }

    /**
     * Checks if a user is blocked or not.
     * @returb {boolean} - True if the user is blocked, false otherwise.
     */
    private async isBlocked({ userId }: { userId: string }): Promise<boolean> {
        if (!this.blockedContacts) this.blockedContacts = await this._blockedContactService.getBlockedContactList();
        return this.blockedContacts.includes(userId);
    }
}
