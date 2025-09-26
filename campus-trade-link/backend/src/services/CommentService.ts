import { eq, and, desc, sql, exists } from 'drizzle-orm';
import { db } from '../db';
import { comments, commentLikes, posts, users } from '../db/schema';
import { 
  Comment,
  CreateCommentInput, 
  UpdateCommentInput,
  PaginationParams,
  PaginatedResponse 
} from '@campus-trade-link/shared';
import { createError } from '../middleware/errorHandler';

export class CommentService {
  async createComment(userId: string, input: CreateCommentInput): Promise<Comment> {
    // Verify post exists
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, input.postId))
      .limit(1);

    if (!post) {
      throw createError('Post not found', 404, 'NOT_FOUND');
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        postId: input.postId,
        userId,
        content: input.content,
      })
      .returning();

    // Update post comments count
    await db
      .update(posts)
      .set({
        commentsCount: sql`${posts.commentsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, input.postId));

    return this.getCommentById(newComment.id, userId);
  }

  async getCommentById(commentId: string, viewerId?: string): Promise<Comment> {
    const [comment] = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) {
      throw createError('Comment not found', 404, 'NOT_FOUND');
    }

    // Check if user liked the comment
    let isLiked = false;
    if (viewerId) {
      const [like] = await db
        .select()
        .from(commentLikes)
        .where(and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, viewerId)
        ))
        .limit(1);
      
      isLiked = !!like;
    }

    return {
      ...comment,
      isLiked,
    };
  }

  async updateComment(commentId: string, userId: string, input: UpdateCommentInput): Promise<Comment> {
    // Verify ownership
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .limit(1);

    if (!existingComment) {
      throw createError('Comment not found or unauthorized', 404, 'NOT_FOUND');
    }

    await db
      .update(comments)
      .set({
        content: input.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    return this.getCommentById(commentId, userId);
  }

  async deleteComment(commentId: string, userId: string): Promise<{ message: string }> {
    // Verify ownership
    const [existingComment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .limit(1);

    if (!existingComment) {
      throw createError('Comment not found or unauthorized', 404, 'NOT_FOUND');
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    // Update post comments count
    await db
      .update(posts)
      .set({
        commentsCount: sql`${posts.commentsCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, existingComment.postId));

    return {
      message: 'Comment deleted successfully',
    };
  }

  async getPostComments(
    postId: string, 
    viewerId: string | undefined,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Comment>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const postComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
        isLiked: viewerId ? exists(
          db.select()
            .from(commentLikes)
            .where(and(
              eq(commentLikes.commentId, comments.id),
              eq(commentLikes.userId, viewerId)
            ))
        ) : sql`false`,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(comments.createdAt));

    const hasMore = postComments.length > limit;
    const data = hasMore ? postComments.slice(0, -1) : postComments;

    return {
      data,
      hasMore,
    };
  }

  async likeComment(commentId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(commentLikes)
      .where(and(
        eq(commentLikes.commentId, commentId),
        eq(commentLikes.userId, userId)
      ))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db
        .delete(commentLikes)
        .where(and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId)
        ));

      // Update comment likes count
      await db
        .update(comments)
        .set({
          likesCount: sql`${comments.likesCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId));

      const [updatedComment] = await db
        .select({ likesCount: comments.likesCount })
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

      return {
        isLiked: false,
        likesCount: updatedComment?.likesCount || 0,
      };
    } else {
      // Like
      await db.insert(commentLikes).values({
        commentId,
        userId,
      });

      // Update comment likes count
      await db
        .update(comments)
        .set({
          likesCount: sql`${comments.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId));

      const [updatedComment] = await db
        .select({ likesCount: comments.likesCount })
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

      return {
        isLiked: true,
        likesCount: updatedComment?.likesCount || 0,
      };
    }
  }
}