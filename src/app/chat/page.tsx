'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Send as SendIcon, Bot as BotIcon, User as UserIcon, Plus as PlusIcon, MessageSquare as MessageSquareIcon } from 'lucide-react';

import ProtectedRoute from '@/components/ProtectedRoute';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

const ChatPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversations and stored selection
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      const storedConvId = localStorage.getItem('conversation_id');
      if (storedConvId) {
        setSelectedConversationId(parseInt(storedConvId));
      }
    }
  }, [isAuthenticated]);

  // Load conversations for the user
  const loadConversations = async () => {
    if (!user?.user_id || !localStorage.getItem('authToken')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'}/api/${user.user_id}/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);

        // If no conversation is selected and we have conversations, select the most recent one
        if (!selectedConversationId && data.length > 0) {
          const mostRecent = data.reduce((prev: Conversation, current: Conversation) =>
            new Date(prev.last_activity) > new Date(current.last_activity) ? prev : current
          );
          setSelectedConversationId(mostRecent.id);
          localStorage.setItem('conversation_id', mostRecent.id.toString());
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load conversation history when selected conversation changes
  useEffect(() => {
    if (selectedConversationId && user?.user_id) {
      loadConversationHistory(selectedConversationId);
    }
  }, [selectedConversationId, user?.user_id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation history
  const loadConversationHistory = async (convId: number) => {
    if (!user?.user_id || !localStorage.getItem('authToken')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'}/api/${user.user_id}/conversations/${convId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const history = data.map((msg: any) => ({
          id: `${msg.id}-${msg.timestamp}`,
          role: msg.sender_type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setMessages([]); // Reset to empty if there's an error
    }
  };

  // Create a new conversation
  const createNewConversation = () => {
    setMessages([]);
    setSelectedConversationId(null);
    localStorage.removeItem('conversation_id');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the chat API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860'}/api/${user?.user_id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: selectedConversationId || undefined, // Pass conversation ID if exists
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Store conversation ID in localStorage
      if (data.conversation_id) {
        setSelectedConversationId(data.conversation_id);
        localStorage.setItem('conversation_id', data.conversation_id.toString());
        // Reload conversations to update the list
        await loadConversations();
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle tool calls if present
      if (data.tool_calls && data.tool_calls.length > 0) {
        data.tool_calls.forEach((toolCall: any) => {
          const toolMessage: Message = {
            id: `tool-${toolCall.name}-${Date.now()}`,
            role: 'assistant',
            content: `Tool call: ${toolCall.name} with arguments ${JSON.stringify(toolCall.arguments)} resulted in ${JSON.stringify(toolCall.result)}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, toolMessage]);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Conversations sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Conversations</span>
                <Button
                  onClick={createNewConversation}
                  variant="ghost"
                  size="sm"
                  title="New conversation"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-1">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No conversations yet</p>
                  ) : (
                    conversations.map((conv) => (
                      <Button
                        key={conv.id}
                        variant={selectedConversationId === conv.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left mb-1"
                        onClick={() => {
                          setSelectedConversationId(conv.id);
                          localStorage.setItem('conversation_id', conv.id.toString());
                        }}
                      >
                        <MessageSquareIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">Conversation {conv.id}</span>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main chat area */}
        <div className="flex-1">
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BotIcon className="h-6 w-6 text-blue-600" />
                {selectedConversationId ? `Conversation ${selectedConversationId}` : 'New Conversation'}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedConversationId
                  ? 'Continue your conversation'
                  : 'Start a new conversation with the Todo AI Assistant'}
              </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <BotIcon className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedConversationId
                          ? 'No messages in this conversation yet'
                          : 'Welcome to the Todo AI Assistant!'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {selectedConversationId
                          ? 'Start a conversation to manage your tasks using natural language.'
                          : 'I can help you manage your tasks using natural language. Try saying things like:'}
                      </p>
                      {!selectedConversationId && (
                        <ul className="mt-2 text-left text-gray-600 dark:text-gray-300 space-y-1">
                          <li className="ml-4 list-disc">"Add buy groceries to my list"</li>
                          <li className="ml-4 list-disc">"Show me my tasks"</li>
                          <li className="ml-4 list-disc">"Complete task 1"</li>
                          <li className="ml-4 list-disc">"Update my shopping list"</li>
                        </ul>
                      )}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <BotIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                            }`}
                        >
                          <p>{message.content}</p>
                        </div>

                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <BotIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg rounded-tl-none px-4 py-2">
                        <div className="flex space-x-2">
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    <SendIcon className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Example: "Add buy milk to my tasks" or "Show me what I need to do"
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProtectedChatPage = () => {
  return (
    <ProtectedRoute requireAuth={true} fallbackPath="/login">
      <ChatPage />
    </ProtectedRoute>
  );
};

export default ProtectedChatPage;