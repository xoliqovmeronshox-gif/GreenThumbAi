import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sprout, Trash2 } from 'lucide-react';
import { createChatSession, sendMessageToChat } from '../services/gemini';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Chat, Content } from "@google/genai";

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        return JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm GreenThumb, your gardening assistant. Ask me anything about your plants!",
        timestamp: new Date()
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat session on mount with history
    const initChat = () => {
      try {
        // Convert existing messages to Gemini Content format
        // Exclude the welcome message and any error messages
        const history: Content[] = messages
          .filter(m => !m.isError && m.id !== 'welcome')
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));

        chatSessionRef.current = createChatSession(history);
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    };

    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Ensure chat session exists
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToChat(chatSessionRef.current, userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I had trouble connecting to the garden network. Please check your API Key or try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const welcomeMsg: Message = {
        id: 'welcome',
        role: 'model',
        text: "Hello! I'm GreenThumb, your gardening assistant. Ask me anything about your plants!",
        timestamp: new Date()
    };
    setMessages([welcomeMsg]);
    localStorage.removeItem('chat_history');
    // Re-initialize chat session without history
    chatSessionRef.current = createChatSession([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-emerald-100">
      {/* Header */}
      <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Plant Doctor Chat</h2>
            <p className="text-emerald-100 text-xs">Ask about care, pests, or soil</p>
          </div>
        </div>
        <button 
          onClick={handleClearHistory}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-emerald-100 hover:text-white"
          title="Clear History"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200 text-emerald-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Sprout size={16} />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white' 
                : msg.isError 
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-white border border-emerald-50 text-gray-800'
            }`}>
              {msg.role === 'model' ? (
                <MarkdownRenderer content={msg.text} className={msg.isError ? 'text-red-700' : ''} />
              ) : (
                <p className="whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Sprout size={16} />
            </div>
            <div className="bg-white border border-emerald-50 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span className="text-gray-500 text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-emerald-100">
        <div className="flex gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your plants..."
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[50px] max-h-[150px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">AI can make mistakes. Double check important care info.</p>
      </div>
    </div>
  );
};

export default ChatBot;