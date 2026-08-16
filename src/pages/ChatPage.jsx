import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Send, Plus, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const suggestedPrompts = [
  "What is eczema?",
  "How to treat acne?",
  "Signs of melanoma?",
  "Daily skin care tips"
];

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: 'Hello! I am the Derma AI Assistant. I can help you understand skin conditions, recommend general care routines, or explain your scan results. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Preserve API call to /api/chat/
      const response = await api.post('/api/chat/', { question: text });
      
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: response.data.answer || 'I received your message.' 
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const serverMessage = error?.response?.data?.detail || error?.response?.data?.answer || error?.message;
      const errorMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: serverMessage || 'Sorry, I am having trouble connecting to the server. Please try again later.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      <Sidebar activePage="chat" />
      <div className="flex-1 flex flex-col ml-[240px] relative h-full">
        <Header />
        
        <main className="flex-1 overflow-hidden p-8 flex flex-col">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Header Area */}
            <div className="p-6 border-b border-gray-100 bg-white z-10 flex-none">
              <h1 className="text-2xl font-bold text-gray-900">Derma AI Assistant</h1>
              <p className="text-gray-500 mt-1">Ask questions about skin conditions, treatments, and your health</p>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 mt-auto mb-auto">
                      {msg.role === 'ai' ? (
                        <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-[#0D9488]" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[#00796B] text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[75%] gap-3 flex-row">
                    <div className="flex-shrink-0 mt-auto mb-auto">
                      <div className="w-8 h-8 rounded-full bg-[#0D9488]/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#0D9488]" />
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-bl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#0D9488] animate-spin" />
                      <span className="text-sm text-gray-500">Derma AI is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 flex-none">
              {/* Quick Actions (Suggested Prompts) */}
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors font-medium border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={onSubmit} className="relative flex items-center gap-2">
                <button 
                  type="button"
                  className="p-3 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-transparent"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488]/50 transition-all text-gray-700"
                />
                
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-2 bg-[#00796B] hover:bg-[#005A4F] text-white rounded-full transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
