export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  actor?: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
  };
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MESSAGE = 'MESSAGE',
  PRODUCT_INQUIRY = 'PRODUCT_INQUIRY',
  SYSTEM = 'SYSTEM'
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  actorId?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  productInquiries: boolean;
  systemUpdates: boolean;
  createdAt: Date;
  updatedAt: Date;
}