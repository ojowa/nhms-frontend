'use client';

import React, { useState } from 'react';

interface ChatbotInputProps {
  onSend: (messageText: string) => void;
  isLoading: boolean;
}

const ChatbotInput: React.FC<ChatbotInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-2 border-t">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full py-2 px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="ml-2 rounded-full h-10 w-10 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isLoading || !text.trim()}
        aria-label="Send message"
      >
        {/* Send Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.886l-4.5 1.75a1 1 0 00-.894.894l-1.75 4.5a1 1 0 001.178 1.178l4.5-1.75a1 1 0 00.894-.894l1.75-4.5a1 1 0 00-1.178-1.178zM12.25 7.75a.5.5 0 100-1 .5.5 0 000 1z"/>
            <path fillRule="evenodd" d="M1.146 11.146a.5.5 0 01.5-.5h2.51l-2.09 6.27a.5.5 0 01-.94.06L1.146 11.146zM11.5 8.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v5a.5.5 0 01-1 0V9h-4.5a.5.5 0 01-.5-.5z" clipRule="evenodd"/>
        </svg>
      </button>
    </form>
  );
};

export default ChatbotInput;
