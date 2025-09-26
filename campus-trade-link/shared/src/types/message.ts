export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
  };
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PRODUCT = 'PRODUCT'
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  otherParticipant: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    isOnline?: boolean;
  };
}

export interface CreateMessageInput {
  conversationId?: string;
  recipientId?: string;
  content: string;
  messageType?: MessageType;
}

export interface ConversationPreview {
  id: string;
  otherParticipant: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
    isFromMe: boolean;
  };
  unreadCount: number;
  updatedAt: Date;
}