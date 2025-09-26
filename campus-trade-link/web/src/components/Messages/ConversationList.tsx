import { ConversationPreview, formatRelativeTime } from '@campus-trade-link/shared';
import { clsx } from 'clsx';
import Image from 'next/image';

interface ConversationListProps {
  conversations: ConversationPreview[];
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

export default function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onConversationSelect 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation by visiting someone's profile</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onConversationSelect(conversation.id)}
          className={clsx(
            'w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100',
            selectedConversationId === conversation.id && 'bg-primary-50 border-primary-200'
          )}
        >
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            {conversation.otherParticipant.profileImageUrl ? (
              <Image
                src={conversation.otherParticipant.profileImageUrl}
                alt={conversation.otherParticipant.displayName || conversation.otherParticipant.username}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {(conversation.otherParticipant.displayName || conversation.otherParticipant.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Name and verification */}
              <div className="flex items-center space-x-1 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.otherParticipant.displayName || conversation.otherParticipant.username}
                </h3>
                {conversation.otherParticipant.isVerified && (
                  <span className="text-primary-600 text-sm">✓</span>
                )}
                {conversation.otherParticipant.isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>

              {/* Last message */}
              {conversation.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.isFromMe && 'You: '}
                  {conversation.lastMessage.content}
                </p>
              )}

              {/* Time and unread indicator */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {conversation.lastMessage && formatRelativeTime(new Date(conversation.lastMessage.createdAt))}
                </span>
                {conversation.unreadCount > 0 && (
                  <div className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}