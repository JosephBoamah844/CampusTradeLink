import { useState, useEffect, useRef } from 'react';
import { Message, formatRelativeTime } from '@campus-trade-link/shared';
import { messageApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/auth';
import Button from '@/components/UI/Button';
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

interface MessageThreadProps {
  conversationId: string;
  onBack: () => void;
}

export default function MessageThread({ conversationId, onBack }: MessageThreadProps) {
  const { user } = useAuthStore();
  const { 
    joinConversation, 
    leaveConversation, 
    sendMessage, 
    onNewMessage, 
    startTyping, 
    stopTyping,
    onUserTyping,
    onUserStoppedTyping,
  } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await messageApi.getConversationMessages(conversationId);
      setMessages(response.data.data.data.reverse()); // Reverse to show oldest first
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    
    if (!content || isSending) return;

    setIsSending(true);
    try {
      // Send via socket for real-time
      sendMessage({
        conversationId,
        content,
        messageType: 'TEXT',
      });

      setNewMessage('');
      stopTyping(conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId);
    }, 1000);
  };

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleUserTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setOtherUserTyping(true);
      }
    };

    const handleUserStoppedTyping = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setOtherUserTyping(false);
      }
    };

    onNewMessage(handleNewMessage);
    onUserTyping(handleUserTyping);
    onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      // Clean up listeners
    };
  }, [conversationId, user?.id, onNewMessage, onUserTyping, onUserStoppedTyping]);

  // Join/leave conversation room
  useEffect(() => {
    joinConversation(conversationId);
    fetchMessages();

    return () => {
      leaveConversation(conversationId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="md:hidden p-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="font-semibold text-gray-900">Conversation</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              'flex',
              message.senderId === user?.id ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'message-bubble px-4 py-2 rounded-2xl max-w-xs lg:max-w-md',
                message.senderId === user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className={clsx(
                'text-xs mt-1',
                message.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
              )}>
                {formatRelativeTime(new Date(message.createdAt))}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            isLoading={isSending}
            className="flex items-center justify-center w-10 h-10 rounded-full p-0"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}