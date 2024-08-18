'use client';

import React from 'react';
import ChatBot from './components/ChatBot';
import Board from './components/Board';

export default function Home() {
  return (
    <div className="flex h-screen bg-yellow-100">
      <div className="flex-1 flex overflow-hidden">
        {/* Phần ChatBot */}
        <div className="w-1/3 flex flex-col bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black">Chat with AI</h2>
          </div>
          <ChatBot />
        </div>

        {/* Phần Board Game XO */}
        <div className="w-2/3 flex flex-col bg-white">
          <div className="p-4">
            <h2 className="text-xl font-semibold">Caro Game</h2>
          </div>
          <div className="flex-1 p-4 flex justify-center items-center">
            {/* Thêm viền đen và bo góc xung quanh Board */}
            <div className="border-4 border-black rounded-lg">
              <Board boardSize={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}