// src/services/aiService.ts
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const chat = new ChatOpenAI({ 
  openAIApiKey: OPENAI_API_KEY,
  temperature: 0.7 
});

const systemPrompt = `You are a helpful AI assistant. Respond concisely and accurately to user queries. If you're unsure, say so.`;

export const getAIResponse = async (userInput: string, chatHistory: string[]) => {
  const messages = [
    new SystemChatMessage(systemPrompt),
    ...chatHistory.map((msg, index) => 
      index % 2 === 0 ? new HumanChatMessage(msg) : new AIChatMessage(msg)
    ),
    new HumanChatMessage(userInput)
  ];

  try {
    const response = await chat.call(messages);
    return response.text;
  } catch (error) {
    console.error("Error calling AI:", error);
    throw error;
  }
};