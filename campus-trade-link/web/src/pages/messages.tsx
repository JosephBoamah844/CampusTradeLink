import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ConversationPreview, Message } from '@campus-trade-link/shared';
import { messageApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import ConversationList from '@/components/Messages/ConversationList';
import MessageThread from '@/components/Messages/MessageThread';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { onNewMessage, onMessageRead } = useSocket();

  const fetchConversations = async () => {
    try {
      const response = await messageApi.getConversations();
      setConversations(response.data.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                isFromMe: false,
              },
              unreadCount: conv.unreadCount + 1,
              updatedAt: message.createdAt,
            };
          }
          return conv;
        })
      );
    };

    const handleMessageRead = (data: { messageId: string; userId: string }) => {
      // Update unread counts when messages are read
      setConversations(prev =>
        prev.map(conv => ({
          ...conv,
          unreadCount: Math.max(0, conv.unreadCount - 1),
        }))
      );
    };

    onNewMessage(handleNewMessage);
    onMessageRead(handleMessageRead);

    return () => {
      // Clean up listeners
    };
  }, [onNewMessage, onMessageRead]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark conversation as read
    messageApi.markConversationRead(conversationId).catch(console.error);
    
    // Update local state
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - Campus Trade Link</title>
        <meta name="description" content="Your direct messages" />
      </Head>

      <div className="max-w-4xl mx-auto h-screen flex">
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full h-full">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation}
              onConversationSelect={handleConversationSelect}
            />
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <MessageThread
                conversationId={selectedConversation}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden w-full h-full">
          {selectedConversation ? (
            <MessageThread
              conversationId={selectedConversation}
              onBack={handleBackToList}
            />
          ) : (
            <div className="bg-white h-full">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation}
                onConversationSelect={handleConversationSelect}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}