import { eq, and, desc, sql, exists, inArray } from 'drizzle-orm';
import { db } from '../db';
import { posts, postLikes, comments, commentLikes, users, follows, userStats } from '../db/schema';
import { 
  Post, 
  PostFeed,
  CreatePostInput, 
  UpdatePostInput,
  PaginationParams,
  PaginatedResponse 
} from '@campus-trade-link/shared';
import { createError } from '../middleware/errorHandler';

export class PostService {
  async createPost(userId: string, input: CreatePostInput): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values({
        userId,
        content: input.content,
        imageUrls: input.imageUrls || [],
      })
      .returning();

    // Update user stats
    await db
      .update(userStats)
      .set({
        postsCount: sql`${userStats.postsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return this.getPostById(newPost.id, userId);
  }

  async getPostById(postId: string, viewerId?: string): Promise<Post> {
    const [post] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrls: posts.imageUrls,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      throw createError('Post not found', 404, 'NOT_FOUND');
    }

    // Check if user liked the post
    let isLiked = false;
    if (viewerId) {
      const [like] = await db
        .select()
        .from(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, viewerId)
        ))
        .limit(1);
      
      isLiked = !!like;
    }

    return {
      ...post,
      isLiked,
    };
  }

  async updatePost(postId: string, userId: string, input: UpdatePostInput): Promise<Post> {
    // Verify ownership
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
      .limit(1);

    if (!existingPost) {
      throw createError('Post not found or unauthorized', 404, 'NOT_FOUND');
    }

    await db
      .update(posts)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    return this.getPostById(postId, userId);
  }

  async deletePost(postId: string, userId: string): Promise<{ message: string }> {
    // Verify ownership
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
      .limit(1);

    if (!existingPost) {
      throw createError('Post not found or unauthorized', 404, 'NOT_FOUND');
    }

    await db.delete(posts).where(eq(posts.id, postId));

    // Update user stats
    await db
      .update(userStats)
      .set({
        postsCount: sql`${userStats.postsCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return {
      message: 'Post deleted successfully',
    };
  }

  async getFeed(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<PostFeed>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    // Get posts from followed users + own posts
    const feedPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrls: posts.imageUrls,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        isLiked: exists(
          db.select()
            .from(postLikes)
            .where(and(
              eq(postLikes.postId, posts.id),
              eq(postLikes.userId, userId)
            ))
        ),
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        or(
          eq(posts.userId, userId), // Own posts
          exists( // Posts from followed users
            db.select()
              .from(follows)
              .where(and(
                eq(follows.followerId, userId),
                eq(follows.followingId, posts.userId)
              ))
          )
        )
      )
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(posts.createdAt));

    const hasMore = feedPosts.length > limit;
    const data = hasMore ? feedPosts.slice(0, -1) : feedPosts;

    return {
      data,
      hasMore,
    };
  }

  async getExplorePosts(viewerId: string | undefined, pagination: PaginationParams): Promise<PaginatedResponse<PostFeed>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const explorePosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrls: posts.imageUrls,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        isLiked: viewerId ? exists(
          db.select()
            .from(postLikes)
            .where(and(
              eq(postLikes.postId, posts.id),
              eq(postLikes.userId, viewerId)
            ))
        ) : sql`false`,
      })
      .from(posts)
      .innerJoin(users, and(eq(posts.userId, users.id), eq(users.isActive, true)))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(posts.likesCount), desc(posts.createdAt));

    const hasMore = explorePosts.length > limit;
    const data = hasMore ? explorePosts.slice(0, -1) : explorePosts;

    return {
      data,
      hasMore,
    };
  }

  async getUserPosts(userId: string, viewerId: string | undefined, pagination: PaginationParams): Promise<PaginatedResponse<PostFeed>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const userPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrls: posts.imageUrls,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        isLiked: viewerId ? exists(
          db.select()
            .from(postLikes)
            .where(and(
              eq(postLikes.postId, posts.id),
              eq(postLikes.userId, viewerId)
            ))
        ) : sql`false`,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(posts.createdAt));

    const hasMore = userPosts.length > limit;
    const data = hasMore ? userPosts.slice(0, -1) : userPosts;

    return {
      data,
      hasMore,
    };
  }

  async likePost(postId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db
        .delete(postLikes)
        .where(and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        ));

      // Update post likes count
      await db
        .update(posts)
        .set({
          likesCount: sql`${posts.likesCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      const [updatedPost] = await db
        .select({ likesCount: posts.likesCount })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      return {
        isLiked: false,
        likesCount: updatedPost?.likesCount || 0,
      };
    } else {
      // Like
      await db.insert(postLikes).values({
        postId,
        userId,
      });

      // Update post likes count
      await db
        .update(posts)
        .set({
          likesCount: sql`${posts.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));

      const [updatedPost] = await db
        .select({ likesCount: posts.likesCount })
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      return {
        isLiked: true,
        likesCount: updatedPost?.likesCount || 0,
      };
    }
  }

  async getPostLikes(postId: string, pagination: PaginationParams): Promise<PaginatedResponse<any>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const likes = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isVerified: users.isVerified,
        likedAt: postLikes.createdAt,
      })
      .from(postLikes)
      .innerJoin(users, eq(postLikes.userId, users.id))
      .where(eq(postLikes.postId, postId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(postLikes.createdAt));

    const hasMore = likes.length > limit;
    const data = hasMore ? likes.slice(0, -1) : likes;

    return {
      data,
      hasMore,
    };
  }
}