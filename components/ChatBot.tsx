import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, User, Bot } from 'lucide-react';
import { useChatbot } from '../hooks/useChatBot';

const ChatBot: React.FC = () => {
  const { chatHistory, isTyping, sendMessage } = useChatbot();
  const [inputMessage, setInputMessage] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage({ type: 'chat', content: inputMessage.trim() });
      setInputMessage('');
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const renderMessage = (message: any, index: number) => {
    const isBot = message.role === 'assistant';
    let content = message.content;
  
    if (isBot) {
      try {
        content = JSON.parse(message.content);
      } catch (error) {
        // If not JSON, keep the content as is
        console.log("Not a JSON message:", message.content);
      }
    }
  
    return (
      <div key={index} className="mb-4">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mr-2">
            {isBot ? (
              <Bot className="w-5 h-5 text-black" />
            ) : (
              <User className="w-5 h-5 text-black" />
            )}
          </div>
          <p className="font-semibold text-black">
            {isBot ? 'GokuMoku' : 'Player'}
          </p>
        </div>
        {isBot && typeof content === 'object' ? (
          <div>
            <p className="text-gray-800">{content.message}</p>
            {content.trashTalk && (
              <p className="text-red-500 italic mt-2">Trash Talk: {content.trashTalk}</p>
            )}
            {content.explanation && (
              <p className="text-blue-500 mt-2">Explanation: {content.explanation}</p>
            )}
            {content.suggestion && (
              <p className="text-green-500 mt-2">Suggestion: {content.suggestion}</p>
            )}
            {content.next_move && (
              <p className="text-purple-500 mt-2">Next Move: ({content.next_move.x}, {content.next_move.y})</p>
            )}
          </div>
        ) : (
          <p className="text-gray-800">{content}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{new Date().toLocaleString()}</p>
        {index !== chatHistory.length - 1 && (
          <hr className="border-t border-gray-200 my-4" />
        )}
      </div>
    );
  };

  
  return (
    <div className="flex flex-col h-screen bg-white">
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ aspectRatio: '16 / 9' }}
        ref={chatContainerRef}
      >
        {chatHistory.map((message, index) => renderMessage(message, index))}
        {isTyping && (
          <div className="flex items-center mt-4">
            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mr-2">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <span className="text-gray-800">GokuMoku is typing...</span>
            <Loader className="w-4 h-4 ml-2 text-black animate-spin" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a message..."
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;