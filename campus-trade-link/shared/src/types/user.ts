export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isFollower?: boolean;
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface UpdateUserInput {
  username?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowUser {
  id: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  isVerified: boolean;
}