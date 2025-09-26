import { useState, useEffect, useRef } from 'react';
import { Notification, formatRelativeTime } from '@campus-trade-link/shared';
import { clsx } from 'clsx';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Mock notifications for now
  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId: 'user-1',
      type: 'LIKE',
      title: 'New Like',
      message: 'John Doe liked your post',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      actor: {
        id: 'john-doe',
        username: 'johndoe',
        displayName: 'John Doe',
        profileImageUrl: undefined,
      },
    },
    {
      id: '2',
      userId: 'user-1',
      type: 'FOLLOW',
      title: 'New Follower',
      message: 'Jane Smith started following you',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      actor: {
        id: 'jane-smith',
        username: 'janesmith',
        displayName: 'Jane Smith',
        profileImageUrl: undefined,
      },
    },
    {
      id: '3',
      userId: 'user-1',
      type: 'COMMENT',
      title: 'New Comment',
      message: 'Mike Wilson commented on your post',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actor: {
        id: 'mike-wilson',
        username: 'mikewilson',
        displayName: 'Mike Wilson',
        profileImageUrl: undefined,
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                'px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0',
                !notification.isRead && 'bg-primary-50'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* Actor Avatar */}
                {notification.actor?.profileImageUrl ? (
                  <img
                    src={notification.actor.profileImageUrl}
                    alt={notification.actor.displayName || notification.actor.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {(notification.actor?.displayName || notification.actor?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {mockNotifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}