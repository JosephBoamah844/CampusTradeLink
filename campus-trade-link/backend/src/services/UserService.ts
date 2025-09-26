import { eq, and, or, like, desc, count, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, follows, userStats } from '../db/schema';
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput, 
  UserProfile,
  PaginationParams,
  PaginatedResponse,
  FollowUser 
} from '@campus-trade-link/shared';
import { hashPassword, generateEmailVerificationToken } from '../lib/auth';
import { sendVerificationEmail } from '../lib/email';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';

export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Check user limit
    const userCount = await db.select({ count: count() }).from(users);
    if (userCount[0].count >= config.MAX_USERS) {
      throw createError(
        'Registration is currently limited. Please contact support.',
        403,
        'USER_LIMIT_REACHED'
      );
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw createError(
        'Email already registered',
        400,
        'DUPLICATE_EMAIL'
      );
    }

    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, input.username))
      .limit(1);

    if (existingUsername.length > 0) {
      throw createError(
        'Username already taken',
        400,
        'DUPLICATE_USERNAME'
      );
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);
    const emailVerificationToken = generateEmailVerificationToken();

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        username: input.username,
        displayName: input.displayName,
        passwordHash,
        emailVerificationToken,
      })
      .returning();

    // Create user stats record
    await db.insert(userStats).values({
      userId: newUser.id,
    });

    // Send verification email
    await sendVerificationEmail(input.email, emailVerificationToken);

    return this.mapToUser(newUser);
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.isActive, true)))
      .limit(1);

    return user ? this.mapToUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)))
      .limit(1);

    return user ? this.mapToUser(user) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.isActive, true)))
      .limit(1);

    return user ? this.mapToUser(user) : null;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    // Check if username is taken (if updating username)
    if (input.username) {
      const existingUser = await db
        .select()
        .from(users)
        .where(and(
          eq(users.username, input.username),
          sql`${users.id} != ${userId}`
        ))
        .limit(1);

      if (existingUser.length > 0) {
        throw createError(
          'Username already taken',
          400,
          'DUPLICATE_USERNAME'
        );
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw createError('User not found', 404, 'NOT_FOUND');
    }

    return this.mapToUser(updatedUser);
  }

  async verifyEmail(token: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);

    if (!user) {
      return false;
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return true;
  }

  async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw createError('Cannot follow yourself', 400, 'VALIDATION_ERROR');
    }

    // Check if already following
    const existingFollow = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ))
      .limit(1);

    if (existingFollow.length > 0) {
      return false; // Already following
    }

    // Create follow relationship
    await db.insert(follows).values({
      followerId,
      followingId,
    });

    // Update stats
    await this.updateUserStats(followerId, 'following', 1);
    await this.updateUserStats(followingId, 'followers', 1);

    return true;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));

    if (result.rowCount === 0) {
      return false; // Not following
    }

    // Update stats
    await this.updateUserStats(followerId, 'following', -1);
    await this.updateUserStats(followingId, 'followers', -1);

    return true;
  }

  async getFollowers(
    userId: string, 
    pagination: PaginationParams
  ): Promise<PaginatedResponse<FollowUser>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const followers = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isVerified: users.isVerified,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(follows.createdAt));

    const hasMore = followers.length > limit;
    const data = hasMore ? followers.slice(0, -1) : followers;

    return {
      data,
      hasMore,
    };
  }

  async getFollowing(
    userId: string, 
    pagination: PaginationParams
  ): Promise<PaginatedResponse<FollowUser>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const following = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
        isVerified: users.isVerified,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(follows.createdAt));

    const hasMore = following.length > limit;
    const data = hasMore ? following.slice(0, -1) : following;

    return {
      data,
      hasMore,
    };
  }

  async searchUsers(
    query: string, 
    pagination: PaginationParams
  ): Promise<PaginatedResponse<User>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const searchUsers = await db
      .select()
      .from(users)
      .where(and(
        or(
          like(users.username, `%${query}%`),
          like(users.displayName, `%${query}%`)
        ),
        eq(users.isActive, true),
        eq(users.isVerified, true)
      ))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const hasMore = searchUsers.length > limit;
    const data = hasMore ? searchUsers.slice(0, -1) : searchUsers;

    return {
      data: data.map(user => this.mapToUser(user)),
      hasMore,
    };
  }

  async getUserProfile(userId: string, viewerId?: string): Promise<UserProfile | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    let isFollowing = false;
    let isFollower = false;

    if (viewerId && viewerId !== userId) {
      // Check if viewer is following this user
      const followingCheck = await db
        .select()
        .from(follows)
        .where(and(
          eq(follows.followerId, viewerId),
          eq(follows.followingId, userId)
        ))
        .limit(1);
      
      isFollowing = followingCheck.length > 0;

      // Check if this user is following the viewer
      const followerCheck = await db
        .select()
        .from(follows)
        .where(and(
          eq(follows.followerId, userId),
          eq(follows.followingId, viewerId)
        ))
        .limit(1);
      
      isFollower = followerCheck.length > 0;
    }

    return {
      ...user,
      isFollowing,
      isFollower,
    };
  }

  private async updateUserStats(
    userId: string, 
    field: 'followers' | 'following' | 'posts' | 'products', 
    delta: number
  ): Promise<void> {
    const updateField = field === 'followers' ? 'followersCount' :
                      field === 'following' ? 'followingCount' :
                      field === 'posts' ? 'postsCount' : 'productsCount';

    await db
      .update(userStats)
      .set({
        [updateField]: sql`${userStats[updateField]} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));
  }

  private mapToUser(dbUser: any): User {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, dbUser.id))
      .limit(1);

    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      displayName: dbUser.displayName,
      bio: dbUser.bio,
      profileImageUrl: dbUser.profileImageUrl,
      isVerified: dbUser.isVerified,
      isActive: dbUser.isActive,
      followersCount: stats?.followersCount || 0,
      followingCount: stats?.followingCount || 0,
      postsCount: stats?.postsCount || 0,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}