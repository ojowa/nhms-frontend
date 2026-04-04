'use client';

import React, { useEffect, useRef, useState } from 'react';
import { chatbotSocketService } from '@/services/chatbotService';
import { ChatMessage as ChatMessageType } from '@/types/chatbot';
import ChatMessage from './ChatMessage';
import ChatbotInput from './ChatbotInput';

const ChatbotWindow = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = 'unique-session-id'; // In a real app, this should be dynamically generated and managed
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Mock welcome message
    const welcomeMessage: ChatMessageType = {
        id: 'welcome',
        text: 'Hello! I am the NHMS Bot. How can I assist you today?',
        sender: 'bot',
        timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    chatbotSocketService.connect(sessionId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      if (newMessage.sender === 'bot') {
        setIsLoading(false); // Stop loading when bot responds
      }
    });

    return () => {
      chatbotSocketService.disconnect();
    };
  }, []);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (messageText: string) => {
    setIsLoading(true); // Start loading when user sends a message
    chatbotSocketService.sendMessage(sessionId, messageText);
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">NHMS Bot</h3>
        <p className="text-xs text-gray-500">Your AI Health Assistant</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <div className="flex items-end gap-2 justify-start">
                <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-gray-200 text-gray-800">
                    <div className="flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full ml-1 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full ml-1 animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatbotInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatbotWindow;
