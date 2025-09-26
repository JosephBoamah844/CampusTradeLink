export const APP_CONFIG = {
  MAX_USERS: 10, // Testing constraint
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_POST: 4,
  MAX_IMAGES_PER_PRODUCT: 6,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  STUDENT_EMAIL_DOMAIN: '@st.ug.edu.gh',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    ME: '/users/me',
    PROFILE: '/users/:id',
    UPDATE: '/users/me',
    FOLLOW: '/users/:id/follow',
    UNFOLLOW: '/users/:id/unfollow',
    FOLLOWERS: '/users/:id/followers',
    FOLLOWING: '/users/:id/following',
    SEARCH: '/users/search',
  },
  POSTS: {
    FEED: '/posts/feed',
    EXPLORE: '/posts/explore',
    CREATE: '/posts',
    GET: '/posts/:id',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
    LIKE: '/posts/:id/like',
    UNLIKE: '/posts/:id/unlike',
    COMMENTS: '/posts/:id/comments',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: '/products/:id',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    MY_PRODUCTS: '/products/me',
    CATEGORIES: '/products/categories',
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: '/messages/conversations/:id',
    SEND: '/messages',
    MARK_READ: '/messages/:id/read',
  },
  UPLOADS: {
    UPLOAD: '/uploads',
    DELETE: '/uploads/:id',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
  },
} as const;

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NEW_NOTIFICATION: 'new_notification',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_USERNAME: 'DUPLICATE_USERNAME',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  USER_LIMIT_REACHED: 'USER_LIMIT_REACHED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Account created successfully. Please check your email for verification.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET: 'Password reset successfully.',
  POST_CREATED: 'Post created successfully.',
  POST_UPDATED: 'Post updated successfully.',
  POST_DELETED: 'Post deleted successfully.',
  PRODUCT_CREATED: 'Product listed successfully.',
  PRODUCT_UPDATED: 'Product updated successfully.',
  PRODUCT_DELETED: 'Product removed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  MESSAGE_SENT: 'Message sent successfully.',
} as const;