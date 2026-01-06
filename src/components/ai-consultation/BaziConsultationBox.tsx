'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/button';
import KLineChart from '@/components/ai-consultation/KLineChart';
import { 
  Calendar, Clock, Send, Loader2, Sparkles, 
  ArrowRight, CheckCircle, AlertCircle, MessageSquare 
} from 'lucide-react';

type Step = 'birth-input' | 'chatting';
type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type TrendReport = {
  title: string;
  subtitle: string;
  timeRangeLabel: string;
  kline: {
    unit: 'year';
    min: number;
    max: number;
    items: Array<{
      label: string;
      open: number;
      high: number;
      low: number;
      close: number;
      tone: 'up' | 'down' | 'flat';
      theme: string;
      note: string;
    }>;
  };
  highlights?: Array<{ label: string; note: string }>;
  advice?: { do?: string[]; avoid?: string[] };
  disclaimer?: string;
};

// 格式化AI输出的组件
const FormattedMessage = ({ content }: { content: string }) => {
  // 解析 Markdown
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // 处理标题 (### Title)
    if (trimmed.startsWith('###')) {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="space-y-2 mb-4">{currentList}</ul>);
        currentList = [];
      }
      const title = trimmed.replace(/^###\s*/, '');
      elements.push(
        <div key={`title-${index}`} className="flex items-center gap-2 mt-6 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-[#FF6F61] to-[#FF8A7A] rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
        </div>
      );
      return;
    }
    
    // 处理列表 (1. Item or - Item)
    if (/^(\d+\.|\-)\s/.test(trimmed)) {
      const item = trimmed.replace(/^(\d+\.|\-)\s*/, '');
      // 解析加粗
      const parts = item.split(/(\*\*.*?\*\*)/);
      currentList.push(
        <li key={`li-${index}`} className="flex gap-3 text-sm text-gray-600 leading-relaxed group">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] flex items-center justify-center text-[10px] font-bold mt-0.5 group-hover:bg-[#FF6F61] group-hover:text-white transition-colors">
            {currentList.length + 1}
          </span>
          <p>
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? 
                <strong key={i} className="text-[#FF6F61] font-semibold">{part.slice(2, -2)}</strong> : part
            )}
          </p>
        </li>
      );
      return;
    }
    
    // 处理加粗文本 (强调内容)
    if (trimmed.includes('**')) {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="space-y-2 mb-4">{currentList}</ul>);
        currentList = [];
      }
      
      const parts = trimmed.split(/(\*\*.*?\*\*)/);
      elements.push(
        <p key={`p-${index}`} className="text-sm text-gray-600 leading-relaxed mb-4">
          {parts.map((part, i) => 
            part.startsWith('**') && part.endsWith('**') ? 
              <span key={i} className="px-1.5 py-0.5 bg-gradient-to-r from-[#FF6F61]/5 to-[#FF8A7A]/10 text-[#FF6F61] font-bold rounded-md mx-0.5">{part.slice(2, -2)}</span> : part
          )}
        </p>
      );
      return;
    }
    
    // 处理分割线
    if (trimmed === '---') {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="space-y-2 mb-4">{currentList}</ul>);
        currentList = [];
      }
      elements.push(<hr key={`hr-${index}`} className="my-8 border-t border-dashed border-gray-200" />);
      return;
    }

    // 普通文本
    if (trimmed) {
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${index}`} className="space-y-2 mb-4">{currentList}</ul>);
        currentList = [];
      }
      elements.push(<p key={`p-${index}`} className="text-sm text-gray-600 leading-relaxed mb-4">{trimmed}</p>);
    }
  });
  
  // 处理最后的列表
  if (currentList.length > 0) {
    elements.push(<ul key="list-final" className="space-y-2 mb-4">{currentList}</ul>);
  }
  
  return <div className="formatted-content">{elements}</div>;
};

export default function BaziConsultationBox() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>('birth-input');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [consultationId, setConsultationId] = useState<string>('');
  
  // Birth input
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestUpgrade, setSuggestUpgrade] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showDonation, setShowDonation] = useState(false);
  const [trendReport, setTrendReport] = useState<TrendReport | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendLang, setTrendLang] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  
  useEffect(() => {
    checkUser();
    checkExistingConsultation();
  }, []);
  
  useEffect(() => {
    // 只在有新消息添加时才自动滚动（不在初始加载或恢复历史记录时滚动）
    if (step === 'chatting' && messages.length > prevMessagesLength.current && prevMessagesLength.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages, step]);

  useEffect(() => {
    // 当进入聊天阶段且拿到 consultationId 时，生成/拉取走势报告（服务端有缓存）
    if (step !== 'chatting' || !consultationId) return;
    if (trendLoading) return;
    if (trendReport && trendLang === language) return;

    const run = async () => {
      setTrendLoading(true);
      try {
        const res = await fetch('/api/ai-consultation/trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultationId, language }),
        });
        const data = await res.json();
        if (data?.report) {
          setTrendReport(data.report);
          setTrendLang(language);
        }
      } catch (e) {
        console.error('Failed to load trend report', e);
      } finally {
        setTrendLoading(false);
      }
    };

    run();
  }, [step, consultationId, language, trendLoading, trendReport, trendLang]);

  useEffect(() => {
    // 切换会话时，清理走势缓存（避免串数据）
    setTrendReport(null);
    setTrendLang('');
  }, [consultationId]);
  
  const checkUser = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/user/login?redirect=/ai-chat');
      return;
    }
    setUser(user);
  };
  
  const checkExistingConsultation = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // 检查是否有进行中的咨询
    const { data: consultations } = await supabase
      .from('ai_consultations')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (consultations && consultations.length > 0) {
      const consultation = consultations[0];
      setConsultationId(consultation.id);
      setMessages(consultation.chat_history || []);
      setMessageCount(consultation.total_messages || 0);
      setBirthDate(new Date(consultation.birth_date).toISOString().split('T')[0]);
      setBirthTime(consultation.birth_time);
      if (consultation.gender === 'male' || consultation.gender === 'female') {
        setGender(consultation.gender);
      }
      setStep('chatting');
    }
  };
  
  const handleSubmitBirth = async () => {
    if (!birthDate || !birthTime) {
      alert(t('rag.birth.error'));
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 先检查是否已存在相同出生时间的咨询会话
      const { data: existingConsultations } = await supabase
        .from('ai_consultations')
        .select('*')
        .eq('user_id', user.id)
        .eq('birth_date', birthDate)
        .eq('birth_time', birthTime)
        .eq('gender', gender)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // 兼容老数据：以前未存 gender 的会话
      const fallbackConsultations =
        !existingConsultations || existingConsultations.length === 0
          ? (
              await supabase
                .from('ai_consultations')
                .select('*')
                .eq('user_id', user.id)
                .eq('birth_date', birthDate)
                .eq('birth_time', birthTime)
                .is('gender', null)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
            ).data
          : null;

      const hit = (existingConsultations && existingConsultations[0]) || (fallbackConsultations && fallbackConsultations[0]);

      if (hit) {
        // 找到了相同出生时间的咨询会话，直接加载
        setConsultationId(hit.id);
        setMessages(hit.chat_history || []);
        setMessageCount(hit.total_messages || 0);
        setStep('chatting');
      } else {
        // 不存在相同出生时间的咨询，创建新的
        const response = await fetch('/api/ai-consultation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate,
            birthTime,
            gender,
            paymentOrderId: null, // 免费试用，无需支付
          }),
        });
        
        const data = await response.json();
        if (data.consultationId) {
          setConsultationId(data.consultationId);
          setStep('chatting');
          
          // 添加欢迎消息
          const welcomeMessage: Message = {
            role: 'assistant',
            content: t('rag.consultation.welcomeMessage'),
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to create consultation:', error);
      alert(t('rag.consultation.createError'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai-consultation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          question: inputMessage,
          language, // 传递用户的语言设置
        }),
      });
      
      const data = await response.json();
      if (data.reply) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setMessageCount(data.messageCount || 0);
        
        if (data.suggestUpgrade) {
          setSuggestUpgrade(true);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('发送消息失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgradeService = () => {
    if (!consultationId) return;
    router.push(`/fortune/upgrade?consultationId=${consultationId}`);
  };
  
  // Birth Input Step
  if (step === 'birth-input') {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 max-w-2xl mx-auto border border-white shadow-2xl shadow-gray-200/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            {t('rag.birth.title')}
          </h2>
          <p className="text-gray-500 font-medium">
            {t('rag.birth.subtitle')}
          </p>
        </div>
        
        <div className="space-y-8 mb-12">
          <div className="group">
            <label className="block text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-widest transition-colors group-focus-within:text-[#FF6F61]">
              <span className="w-4 h-4 inline-flex items-center justify-center">⚧</span>
              {t('rag.birth.gender')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`rounded-2xl px-6 py-4 font-black transition-all border ${
                  gender === 'female'
                    ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-xl shadow-[#FF6F61]/15'
                    : 'bg-white text-gray-700 border-gray-100 hover:border-[#FF6F61]/30'
                }`}
              >
                {t('rag.birth.genderFemale')}
              </button>
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`rounded-2xl px-6 py-4 font-black transition-all border ${
                  gender === 'male'
                    ? 'bg-[#4A90E2] text-white border-[#4A90E2] shadow-xl shadow-[#4A90E2]/15'
                    : 'bg-white text-gray-700 border-gray-100 hover:border-[#4A90E2]/30'
                }`}
              >
                {t('rag.birth.genderMale')}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              {t('rag.birth.genderTip')}
            </p>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-widest transition-colors group-focus-within:text-[#FF6F61]">
              <Calendar className="w-4 h-4" />
              {t('rag.birth.date')}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-[#FF6F61]/5 focus:border-[#FF6F61]/30 focus:bg-white outline-none transition-all appearance-none"
            />
          </div>
          
          <div className="group">
            <label className="block text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-widest transition-colors group-focus-within:text-[#FF6F61]">
              <Clock className="w-4 h-4" />
              {t('rag.birth.time')}
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 font-bold focus:ring-4 focus:ring-[#FF6F61]/5 focus:border-[#FF6F61]/30 focus:bg-white outline-none transition-all appearance-none"
            />
          </div>
        </div>
        
        <div className="bg-[#4A90E2]/5 rounded-3xl p-6 mb-10 border border-[#4A90E2]/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#4A90E2]" />
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-900 mb-2">{t('rag.birth.tipTitle')}</p>
              <ul className="space-y-2 text-gray-500 font-medium">
                <li>• {t('rag.birth.tip1')}</li>
                <li>• {t('rag.birth.tip2')}</li>
                <li>• {t('rag.birth.tip3')}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleSubmitBirth}
          disabled={loading || !birthDate || !birthTime}
          className="w-full py-5 rounded-2xl text-lg font-black shadow-xl shadow-[#FF6F61]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              {t('rag.birth.loading')}
            </>
          ) : (
            <>
              {t('rag.birth.submit')}
              <ArrowRight className="w-5 h-5 ml-3" />
            </>
          )}
        </Button>
      </div>
    );
  }
  
  // Chatting Step
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-gray-200/50 overflow-hidden max-w-5xl mx-auto flex flex-col" style={{ height: '75vh' }}>
      {/* Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] flex items-center justify-center shadow-lg shadow-[#FF6F61]/20">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">{t('rag.consultation.title')}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {t('rag.consultation.messages').replace('{count}', messageCount.toString())}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {suggestUpgrade && (
              <Button
                onClick={handleUpgradeService}
                className="bg-gray-900 text-white hover:bg-black rounded-xl px-6 font-black transition-all"
              >
                {t('rag.consultation.upgrade')}
              </Button>
            )}
            <button
              onClick={() => setShowDonation(true)}
              className="p-3 rounded-xl bg-white hover:bg-gray-50 text-[#FF6F61] border border-gray-100 shadow-sm transition-all flex items-center gap-2 font-bold text-sm"
            >
              💖 {t('rag.consultation.donation')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
        {/* Trend Report */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white shadow-2xl shadow-pink-100/30 overflow-hidden">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] font-black text-xs tracking-widest uppercase">
                  <Sparkles className="w-4 h-4" />
                  {t('rag.trend.badge')}
                </div>
                <h3 className="mt-4 text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  {trendReport?.title || t('rag.trend.titleFallback')}
                </h3>
                <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                  {trendReport?.subtitle || t('rag.trend.subtitleFallback')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {trendReport?.timeRangeLabel || t('rag.trend.rangeFallback')}
                </p>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-[220px]">
                  {trendReport?.disclaimer || t('rag.trend.disclaimerFallback')}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-[#FF6F61]/10 to-[#4A90E2]/10 blur-2xl opacity-60" />
              <div className="relative bg-white rounded-3xl border border-gray-50 p-4 md:p-6 shadow-sm">
                {trendLoading && !trendReport ? (
                  <div className="flex items-center gap-3 text-gray-500 font-bold">
                    <Loader2 className="w-5 h-5 animate-spin text-[#FF6F61]" />
                    {t('rag.trend.loading')}
                  </div>
                ) : trendReport?.kline?.items?.length ? (
                  <KLineChart
                    items={trendReport.kline.items}
                    min={trendReport.kline.min}
                    max={trendReport.kline.max}
                  />
                ) : (
                  <div className="text-sm text-gray-500">{t('rag.trend.empty')}</div>
                )}
              </div>
            </div>

            {!!trendReport?.highlights?.length && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                {trendReport.highlights.slice(0, 3).map((h, idx) => (
                  <div
                    key={`${h.label}-${idx}`}
                    className="rounded-2xl p-5 bg-gradient-to-br from-[#FF6F61]/5 to-white border border-gray-50"
                  >
                    <p className="text-xs font-black tracking-widest uppercase text-gray-400">{h.label}</p>
                    <p className="mt-2 text-sm text-gray-700 font-medium leading-relaxed">{h.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-3xl p-6 md:p-8 ${
                msg.role === 'user'
                  ? 'bg-[#FF6F61] text-white shadow-xl shadow-[#FF6F61]/20'
                  : 'bg-white text-gray-700 border border-white shadow-xl shadow-pink-100/20'
              }`}
            >
              {msg.role === 'assistant' ? (
                <FormattedMessage content={msg.content} />
              ) : (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.content}</div>
              )}
              <div className={`text-[10px] mt-6 pt-4 border-t ${msg.role === 'user' ? 'border-white/10 text-right text-white' : 'border-gray-50 text-gray-400'} font-bold uppercase tracking-widest opacity-40`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <Loader2 className="w-5 h-5 animate-spin text-[#FF6F61]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-100">
        <div className="relative group max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('rag.consultation.inputPlaceholder')}
            className="w-full bg-white border border-gray-200 rounded-[2rem] pl-8 pr-20 py-5 text-gray-900 font-medium focus:ring-4 focus:ring-[#FF6F61]/5 focus:border-[#FF6F61]/30 outline-none transition-all shadow-sm"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="w-12 h-12 rounded-full bg-[#FF6F61] text-white flex items-center justify-center shadow-xl shadow-[#FF6F61]/20 hover:scale-110 active:scale-90 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Donation Modal */}
      {showDonation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full p-10 md:p-16">
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-pink-500/20">
                <Heart size={40} className="text-white" fill="white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                {t('rag.donation.title')}
              </h3>
              <p className="text-gray-500 font-medium">
                {t('rag.donation.desc')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="text-center group">
                <div className="bg-gray-50 rounded-[2rem] p-6 mb-4 border border-gray-100 hover:bg-white hover:shadow-xl transition-all">
                  <div className="w-48 h-48 mx-auto flex items-center justify-center">
                    <img 
                      src="/payQRcode/vxQRcode.png" 
                      alt="微信支付" 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-md"
                    />
                  </div>
                </div>
                <p className="font-bold text-gray-400 tracking-widest uppercase text-xs">微信支付</p>
              </div>
              
              <div className="text-center group">
                <div className="bg-gray-50 rounded-[2rem] p-6 mb-4 border border-gray-100 hover:bg-white hover:shadow-xl transition-all">
                  <div className="w-48 h-48 mx-auto flex items-center justify-center">
                    <img 
                      src="/payQRcode/zfbQRcode.png" 
                      alt="支付宝" 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-md"
                    />
                  </div>
                </div>
                <p className="font-bold text-gray-400 tracking-widest uppercase text-xs">支付宝</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
              <p className="text-sm text-gray-500 text-center italic leading-relaxed">
                {t('rag.donation.footer')}
              </p>
            </div>
            
            <Button
              onClick={() => setShowDonation(false)}
              className="w-full py-5 rounded-2xl font-black shadow-lg"
            >
              {t('rag.donation.close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

