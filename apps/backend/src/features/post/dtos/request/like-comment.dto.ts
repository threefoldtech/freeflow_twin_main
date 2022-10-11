export class LikeCommentDTO {
    likerId: string;
    likerLocation: string;
    postId: string;
    owner: string;
    commentId: string;
    isReplyToComment: boolean;
    replyTo: string;
}
