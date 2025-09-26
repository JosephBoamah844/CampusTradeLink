import { User, FileUpload } from './';

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrls: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface CreatePostInput {
  content: string;
  imageUrls?: string[];
}

export interface UpdatePostInput {
  content?: string;
  imageUrls?: string[];
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface PostFeed extends Post {
  user: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
}