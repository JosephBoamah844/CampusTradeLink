# 📖 Campus Trade Link API Documentation

Base URL: `https://your-api-domain.com/api`

## 🔐 Authentication

All authenticated endpoints require an `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Auth Endpoints

#### POST /auth/register
Register a new user account.

**Body:**
```json
{
  "email": "student@st.ug.edu.gh",
  "username": "johndoe",
  "password": "Password123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification."
}
```

#### POST /auth/login
Login with email and password.

**Body:**
```json
{
  "email": "student@st.ug.edu.gh",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@st.ug.edu.gh",
      "username": "johndoe",
      "displayName": "John Doe",
      "isVerified": true,
      "followersCount": 0,
      "followingCount": 0,
      "postsCount": 0
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/refresh
Refresh access token.

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

#### GET /auth/verify-email?token=<token>
Verify email address.

#### POST /auth/forgot-password
Request password reset.

**Body:**
```json
{
  "email": "student@st.ug.edu.gh"
}
```

#### POST /auth/reset-password
Reset password with token.

**Body:**
```json
{
  "token": "reset_token",
  "password": "NewPassword123"
}
```

## 👥 Users

#### GET /users/me
Get current user profile. *Requires authentication.*

#### PUT /users/me
Update current user profile. *Requires authentication.*

**Body:**
```json
{
  "username": "newusername",
  "displayName": "New Display Name",
  "bio": "Updated bio",
  "profileImageUrl": "https://..."
}
```

#### GET /users/:id
Get user profile by ID.

#### POST /users/:id/follow
Follow a user. *Requires authentication.*

#### DELETE /users/:id/follow
Unfollow a user. *Requires authentication.*

#### GET /users/:id/followers
Get user's followers.

#### GET /users/:id/following
Get users that this user follows.

#### GET /users/search?q=<query>
Search users by username or display name.

## 📝 Posts

#### GET /posts/feed
Get personalized feed. *Requires authentication.*

#### GET /posts/explore
Get trending posts (public feed).

#### POST /posts
Create a new post. *Requires authentication.*

**Body:**
```json
{
  "content": "Post content here...",
  "imageUrls": ["https://image1.jpg", "https://image2.jpg"]
}
```

#### GET /posts/:id
Get specific post by ID.

#### PUT /posts/:id
Update post. *Requires authentication and ownership.*

#### DELETE /posts/:id
Delete post. *Requires authentication and ownership.*

#### POST /posts/:id/like
Like/unlike a post. *Requires authentication.*

#### GET /posts/:id/likes
Get users who liked a post.

#### GET /posts/:id/comments
Get post comments.

#### POST /posts/:id/comments
Create a comment on a post. *Requires authentication.*

**Body:**
```json
{
  "content": "Comment content here..."
}
```

#### PUT /posts/comments/:commentId
Update comment. *Requires authentication and ownership.*

#### DELETE /posts/comments/:commentId
Delete comment. *Requires authentication and ownership.*

#### POST /posts/comments/:commentId/like
Like/unlike a comment. *Requires authentication.*

## 🛒 Products

#### GET /products
Get all products with optional filters.

**Query Parameters:**
- `category`: Product category
- `condition`: Product condition
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `search`: Search query

#### POST /products
Create a new product listing. *Requires authentication.*

**Body:**
```json
{
  "title": "MacBook Pro 2021",
  "description": "Like new condition...",
  "price": 2500.00,
  "imageUrls": ["https://image1.jpg"],
  "category": "Electronics",
  "condition": "LIKE_NEW",
  "location": "Commonwealth Hall"
}
```

#### GET /products/:id
Get specific product by ID.

#### PUT /products/:id
Update product. *Requires authentication and ownership.*

#### DELETE /products/:id
Delete product. *Requires authentication and ownership.*

#### GET /products/me
Get current user's products. *Requires authentication.*

#### GET /products/user/:userId
Get user's products.

#### GET /products/search?q=<query>
Search products.

#### GET /products/category/:category
Get products by category.

#### GET /products/categories
Get available product categories.

## 💬 Messages

#### GET /messages/conversations
Get user's conversations. *Requires authentication.*

#### GET /messages/conversations/:id
Get messages in a conversation. *Requires authentication.*

#### POST /messages
Send a new message. *Requires authentication.*

**Body:**
```json
{
  "conversationId": "uuid", // or "recipientId" for new conversation
  "content": "Message content...",
  "messageType": "TEXT"
}
```

#### POST /messages/:id/read
Mark message as read. *Requires authentication.*

#### POST /messages/conversations/:id/read
Mark all messages in conversation as read. *Requires authentication.*

#### DELETE /messages/conversations/:id
Delete conversation. *Requires authentication.*

## 📤 File Uploads

#### POST /uploads/single
Upload a single file. *Requires authentication.*

**Body:** Form data with `file` field

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://storage-url/path/to/file.jpg",
    "filename": "unique-filename.jpg",
    "mimetype": "image/jpeg",
    "size": 1048576
  }
}
```

#### POST /uploads/multiple
Upload multiple files. *Requires authentication.*

**Body:** Form data with `files` field (array)

#### GET /uploads/me
Get user's uploads. *Requires authentication.*

## 🔌 WebSocket Events

Connect to: `wss://your-api-domain.com`

### Authentication
```javascript
const socket = io('wss://your-api-domain.com', {
  auth: { token: 'jwt_access_token' }
});
```

### Events

#### Client → Server
- `join_conversation`: Join a conversation room
- `leave_conversation`: Leave a conversation room
- `send_message`: Send a new message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing
- `mark_message_read`: Mark message as read

#### Server → Client
- `new_message`: New message received
- `message_read`: Message was read
- `user_online`: User came online
- `user_offline`: User went offline
- `user_typing`: User is typing
- `user_stopped_typing`: User stopped typing
- `new_notification`: New notification
- `post_interaction`: Real-time post like/comment

### Example Usage

```javascript
// Join conversation
socket.emit('join_conversation', conversationId);

// Send message
socket.emit('send_message', {
  conversationId: 'uuid',
  content: 'Hello!',
  messageType: 'TEXT'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "hasMore": true,
    "nextCursor": "cursor_string",
    "total": 100
  }
}
```

## 🚫 Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Access denied
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_EMAIL`: Email already registered
- `DUPLICATE_USERNAME`: Username already taken
- `INVALID_CREDENTIALS`: Invalid email/password
- `EMAIL_NOT_VERIFIED`: Email verification required
- `USER_LIMIT_REACHED`: Registration limit reached
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed
- `RATE_LIMIT_EXCEEDED`: Too many requests

## 🔢 Rate Limits

- **General**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File uploads**: 10 requests per minute

## 🧪 Testing

### Health Check
```bash
curl https://your-api-domain.com/api/health
```

### Authentication Test
```bash
# Register
curl -X POST https://your-api-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@st.ug.edu.gh","username":"testuser","password":"Password123"}'

# Login
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@st.ug.edu.gh","password":"Password123"}'
```

### Authenticated Request
```bash
curl -H "Authorization: Bearer <access_token>" \
  https://your-api-domain.com/api/users/me
```

## 📱 Mobile Deep Links

Configure deep links for mobile app:

- `campustradelink://post/:id` - Open specific post
- `campustradelink://product/:id` - Open specific product
- `campustradelink://user/:id` - Open user profile
- `campustradelink://conversation/:id` - Open conversation

## 🔄 Webhooks

Configure webhooks for external integrations:

- `POST /webhooks/supabase` - Supabase database webhooks
- `POST /webhooks/payment` - Payment processing webhooks