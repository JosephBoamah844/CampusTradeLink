# 🗄️ Database Schema Documentation

Campus Trade Link uses PostgreSQL with Drizzle ORM for type-safe database operations.

## 📊 Schema Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │    posts    │    │  products   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │◄───┤ user_id(FK) │    │ user_id(FK) │──┐
│ email       │    │ content     │    │ title       │  │
│ username    │    │ image_urls  │    │ price       │  │
│ ...         │    │ ...         │    │ ...         │  │
└─────────────┘    └─────────────┘    └─────────────┘  │
       ▲                   ▲                          │
       │                   │                          │
┌─────────────┐    ┌─────────────┐                    │
│   follows   │    │post_likes   │                    │
├─────────────┤    ├─────────────┤                    │
│follower_id  │────┤ user_id(FK) │                    │
│following_id │────┤ post_id(FK) │                    │
└─────────────┘    └─────────────┘                    │
                                                      │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│conversations│    │  messages   │    │ user_stats  │◄─┘
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │◄───┤conversation │    │ user_id(FK) │
│participants │    │ sender_id   │    │followers_cnt│
│ ...         │    │ content     │    │following_cnt│
└─────────────┘    │ ...         │    │ posts_count │
                   └─────────────┘    └─────────────┘
```

## 🏗️ Table Structures

### users
Core user information and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | TEXT | NOT NULL, UNIQUE | Student email (@st.ug.edu.gh) |
| username | TEXT | NOT NULL, UNIQUE | Unique username |
| display_name | TEXT | | Display name |
| bio | TEXT | | User biography |
| profile_image_url | TEXT | | Profile picture URL |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| is_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| email_verification_token | TEXT | | Email verification token |
| password_reset_token | TEXT | | Password reset token |
| password_reset_expires | TIMESTAMP | | Reset token expiration |
| last_login_at | TIMESTAMP | | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `users_email_idx` (UNIQUE) on email
- `users_username_idx` (UNIQUE) on username
- `users_verification_token_idx` on email_verification_token
- `users_reset_token_idx` on password_reset_token

### follows
User follow relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique follow identifier |
| follower_id | UUID | NOT NULL, FK(users.id) | User who follows |
| following_id | UUID | NOT NULL, FK(users.id) | User being followed |
| created_at | TIMESTAMP | DEFAULT NOW() | Follow creation time |

**Indexes:**
- `follows_follower_idx` on follower_id
- `follows_following_idx` on following_id
- `follows_unique_idx` (UNIQUE) on (follower_id, following_id)

### user_stats
Cached user statistics for performance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique stats identifier |
| user_id | UUID | NOT NULL, FK(users.id) | User reference |
| followers_count | INTEGER | DEFAULT 0 | Number of followers |
| following_count | INTEGER | DEFAULT 0 | Number of following |
| posts_count | INTEGER | DEFAULT 0 | Number of posts |
| products_count | INTEGER | DEFAULT 0 | Number of products |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `user_stats_user_idx` (UNIQUE) on user_id

### posts
User posts and content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique post identifier |
| user_id | UUID | NOT NULL, FK(users.id) | Post author |
| content | TEXT | NOT NULL | Post content |
| image_urls | JSON | DEFAULT [] | Array of image URLs |
| likes_count | INTEGER | DEFAULT 0 | Number of likes |
| comments_count | INTEGER | DEFAULT 0 | Number of comments |
| created_at | TIMESTAMP | DEFAULT NOW() | Post creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `posts_user_idx` on user_id
- `posts_created_at_idx` on created_at
- `posts_likes_idx` on likes_count

### post_likes
Post like relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique like identifier |
| user_id | UUID | NOT NULL, FK(users.id) | User who liked |
| post_id | UUID | NOT NULL, FK(posts.id) | Liked post |
| created_at | TIMESTAMP | DEFAULT NOW() | Like creation time |

**Indexes:**
- `post_likes_user_idx` on user_id
- `post_likes_post_idx` on post_id
- `post_likes_unique_idx` (UNIQUE) on (user_id, post_id)

### comments
Post comments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique comment identifier |
| post_id | UUID | NOT NULL, FK(posts.id) | Parent post |
| user_id | UUID | NOT NULL, FK(users.id) | Comment author |
| content | TEXT | NOT NULL | Comment content |
| likes_count | INTEGER | DEFAULT 0 | Number of likes |
| created_at | TIMESTAMP | DEFAULT NOW() | Comment creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `comments_post_idx` on post_id
- `comments_user_idx` on user_id
- `comments_created_at_idx` on created_at

### comment_likes
Comment like relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique like identifier |
| user_id | UUID | NOT NULL, FK(users.id) | User who liked |
| comment_id | UUID | NOT NULL, FK(comments.id) | Liked comment |
| created_at | TIMESTAMP | DEFAULT NOW() | Like creation time |

### products
Marketplace product listings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique product identifier |
| user_id | UUID | NOT NULL, FK(users.id) | Product seller |
| title | TEXT | NOT NULL | Product title |
| description | TEXT | NOT NULL | Product description |
| price | NUMERIC(10,2) | NOT NULL | Product price |
| image_urls | JSON | NOT NULL | Array of image URLs |
| category | TEXT | NOT NULL | Product category |
| condition | TEXT | NOT NULL | Product condition |
| is_available | BOOLEAN | DEFAULT TRUE | Availability status |
| location | TEXT | | Product location |
| views_count | INTEGER | DEFAULT 0 | Number of views |
| created_at | TIMESTAMP | DEFAULT NOW() | Listing creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `products_user_idx` on user_id
- `products_category_idx` on category
- `products_condition_idx` on condition
- `products_price_idx` on price
- `products_available_idx` on is_available
- `products_created_at_idx` on created_at

### conversations
Direct message conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique conversation identifier |
| participants | JSON | NOT NULL | Array of participant user IDs |
| last_message_id | UUID | FK(messages.id) | Latest message reference |
| created_at | TIMESTAMP | DEFAULT NOW() | Conversation creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `conversations_participants_idx` on participants
- `conversations_updated_at_idx` on updated_at

### messages
Direct messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique message identifier |
| conversation_id | UUID | NOT NULL, FK(conversations.id) | Parent conversation |
| sender_id | UUID | NOT NULL, FK(users.id) | Message sender |
| content | TEXT | NOT NULL | Message content |
| message_type | TEXT | DEFAULT 'TEXT' | Message type (TEXT, IMAGE, PRODUCT) |
| metadata | JSON | | Additional message data |
| created_at | TIMESTAMP | DEFAULT NOW() | Message creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `messages_conversation_idx` on conversation_id
- `messages_sender_idx` on sender_id
- `messages_created_at_idx` on created_at
- `messages_type_idx` on message_type

### message_reads
Message read status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique read identifier |
| message_id | UUID | NOT NULL, FK(messages.id) | Read message |
| user_id | UUID | NOT NULL, FK(users.id) | User who read |
| read_at | TIMESTAMP | DEFAULT NOW() | Read timestamp |

**Indexes:**
- `message_reads_message_idx` on message_id
- `message_reads_user_idx` on user_id
- `message_reads_unique_idx` (UNIQUE) on (message_id, user_id)

### notifications
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique notification identifier |
| user_id | UUID | NOT NULL, FK(users.id) | Notification recipient |
| type | TEXT | NOT NULL | Notification type |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| data | JSON | | Additional notification data |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| actor_id | UUID | FK(users.id) | User who triggered notification |
| created_at | TIMESTAMP | DEFAULT NOW() | Notification creation time |

**Indexes:**
- `notifications_user_idx` on user_id
- `notifications_type_idx` on type
- `notifications_is_read_idx` on is_read
- `notifications_actor_idx` on actor_id
- `notifications_created_at_idx` on created_at

### uploads
File upload tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique upload identifier |
| user_id | UUID | FK(users.id) | Upload owner |
| filename | TEXT | NOT NULL | Generated filename |
| original_name | TEXT | NOT NULL | Original filename |
| mimetype | TEXT | NOT NULL | File MIME type |
| size | INTEGER | NOT NULL | File size in bytes |
| url | TEXT | NOT NULL | Public file URL |
| bucket | TEXT | NOT NULL | Storage bucket |
| path | TEXT | NOT NULL | Storage path |
| created_at | TIMESTAMP | DEFAULT NOW() | Upload time |

**Indexes:**
- `uploads_user_idx` on user_id
- `uploads_filename_idx` on filename
- `uploads_created_at_idx` on created_at

## 🔗 Relationships

### One-to-Many
- `users` → `posts` (user can have many posts)
- `users` → `products` (user can have many products)
- `users` → `notifications` (user can have many notifications)
- `posts` → `comments` (post can have many comments)
- `conversations` → `messages` (conversation can have many messages)

### Many-to-Many
- `users` ↔ `users` (follows relationship)
- `users` ↔ `posts` (likes relationship)
- `users` ↔ `comments` (likes relationship)

### Self-Referencing
- `follows`: users following other users
- `conversations`: users participating in conversations

## 📈 Performance Optimizations

### Indexes
All foreign keys have indexes for fast JOINs and lookups.

### Denormalization
- `user_stats` table caches counts to avoid expensive aggregations
- `likes_count` and `comments_count` on posts for quick display
- `last_message_id` on conversations for quick preview

### Partitioning (Future)
For scaling beyond 10K users:
- Partition `posts` by created_at (monthly)
- Partition `messages` by conversation_id
- Partition `notifications` by user_id

## 🔄 Migrations

### Creating Migrations
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### Migration Files
Located in `backend/src/db/migrations/`

### Rollback
```bash
# Rollback last migration
npm run db:migrate:down
```

## 🌱 Seeding

### Demo Data
```bash
cd backend
npm run db:seed
```

Creates:
- 3 demo users with @st.ug.edu.gh emails
- Sample posts and products
- Follow relationships

### Production Seeding
Only run seeds in development. Production should start with empty data.

## 🔐 Security Considerations

### Password Storage
- Passwords hashed with bcrypt (12 rounds)
- Never store plain text passwords

### Email Tokens
- JWT tokens for email verification
- 24-hour expiration for verification
- 1-hour expiration for password reset

### Data Privacy
- Soft delete for user accounts (is_active = false)
- Hard delete available via admin interface
- GDPR compliance considerations

### Rate Limiting
- Database connection pooling (max 20 connections)
- Query timeouts (30 seconds)
- Row-level security (future enhancement)

## 🧪 Testing

### Test Database
```bash
# Create test database
createdb campus_trade_link_test

# Run tests with test database
DATABASE_URL=postgresql://localhost/campus_trade_link_test npm test
```

### Data Validation
- Zod schemas validate all inputs
- Database constraints prevent invalid data
- Foreign key constraints maintain referential integrity

## 📊 Monitoring

### Query Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';
```

### Connection Monitoring
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql
```

### Point-in-Time Recovery
Configure PostgreSQL for PITR with WAL archiving.

## 🚀 Scaling Strategies

### Read Replicas
```javascript
// Configure read/write splitting
const masterDb = drizzle(masterPool);
const replicaDb = drizzle(replicaPool);

// Use replica for read operations
const users = await replicaDb.select().from(usersTable);

// Use master for write operations  
await masterDb.insert(usersTable).values(newUser);
```

### Sharding (Future)
- Shard by user_id for even distribution
- Use consistent hashing for partition selection

### Caching
- Redis for session storage
- Application-level caching for expensive queries
- CDN for static assets

## 📝 Schema Versioning

All schema changes are tracked through migrations:

1. **v1.0.0**: Initial schema
2. **v1.1.0**: Add notifications system
3. **v1.2.0**: Add product inquiries
4. **v2.0.0**: Add real-time messaging

Each migration is atomic and can be rolled back if needed.