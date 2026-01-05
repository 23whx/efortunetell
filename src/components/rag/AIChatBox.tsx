'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, Bot, User, Loader2, BookOpen, Sparkles } from 'lucide-react';
import Button from '../ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    title: string;
    content: string;
    category?: string;
    similarity: number;
  }>;
}

export default function AIChatBox() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const question = input.trim();
    setInput('');
    setLoading(true);
    
    // 添加用户消息
    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          language: t('common.locale') || 'zh',
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // 添加 AI 回复
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        role: 'assistant',
        content: t('rag.errorMessage') || '抱歉，出现了一些问题。请稍后再试。',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6F61] to-[#FF8A7A] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black">{t('rag.title')}</h3>
            <p className="text-sm text-white/80">{t('rag.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6F61]/10 to-[#FF8A7A]/10 flex items-center justify-center mb-4">
              <Bot size={40} className="text-[#FF6F61]" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">
              {t('rag.welcomeTitle')}
            </h4>
            <p className="text-gray-500 max-w-md">
              {t('rag.welcomeMessage')}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-md">
              {[
                t('rag.exampleQuestion1'),
                t('rag.exampleQuestion2'),
                t('rag.exampleQuestion3'),
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example)}
                  className="text-left px-4 py-2 rounded-xl border border-gray-200 hover:border-[#FF6F61] hover:bg-[#FF6F61]/5 transition-all text-sm text-gray-600 hover:text-gray-900"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[#FF6F61] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500 px-2">
                    <BookOpen size={12} />
                    <span>{t('rag.sources')}</span>
                  </div>
                  {message.sources.slice(0, 3).map((source, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-bold text-gray-900">{source.title}</div>
                      <div className="mt-1 line-clamp-2">{source.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 order-2">
                <User size={18} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="px-4 py-3 bg-gray-100 rounded-2xl">
              <Loader2 size={18} className="animate-spin text-gray-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('rag.inputPlaceholder')}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#FF6F61] focus:outline-none resize-none text-sm"
            rows={1}
            maxLength={500}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 bg-[#FF6F61] hover:bg-[#FF5A4D] rounded-2xl flex items-center gap-2"
          >
            <Send size={18} />
          </Button>
        </form>
        <div className="mt-2 text-xs text-gray-400 text-center">
          {t('rag.disclaimer')}
        </div>
      </div>
    </div>
  );
}

