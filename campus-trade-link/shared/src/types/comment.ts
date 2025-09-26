import { User } from './user';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
}

export interface CreateCommentInput {
  postId: string;
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentLike {
  id: string;
  userId: string;
  commentId: string;
  createdAt: Date;
}