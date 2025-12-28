'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function BaziBookingPage() {
  const router = useRouter();
  
  const [birthDateTime, setBirthDateTime] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!birthDateTime) {
      setError('请先填写出生时间');
      return;
    }
    if (!email) {
      setError('请填写您的邮箱地址');
      return;
    }
    
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from('bookings').insert({
        user_id: auth.user?.id ?? null,
        service_type: 'bazi',
        email,
        birth_datetime: birthDateTime,
        notes: notes || null,
        status: 'contact_requested',
      });
      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      console.error('提交预约失败:', err);
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
      
      if (success) {
  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8 text-center">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-4">提交成功</h1>
          <p className="text-gray-700 mb-6">
            我已收到你的需求。请直接添加 LINE：<span className="font-semibold select-all">whx953829</span>
          </p>
          <div className="flex justify-center gap-3">
            <Button className="bg-[#FF6F61] text-white" onClick={() => router.push('/contact')}>
              去联系方式页面
            </Button>
            <Button className="bg-gray-200 text-gray-800" onClick={() => router.push('/fortune')}>
              返回服务列表
            </Button>
          </div>
        </div>
              </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
        <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">八字预约（无需支付）</h1>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            出生时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={birthDateTime}
              onChange={(e) => setBirthDateTime(e.target.value)}
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <Mail className="mr-2 text-[#FF6F61]" size={16} />
            邮箱地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
            />
          <p className="text-xs text-gray-500 mt-1">用于后续沟通与确认。</p>
      </div>
      
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">补充说明（可选）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border border-[#FF6F61] rounded w-full py-2 px-3"
            rows={4}
            placeholder="你想咨询的重点/背景信息..."
          />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
        <div className="flex justify-center">
          <Button className="bg-[#FF6F61] text-white px-6 py-2" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '提交中...' : '提交需求'}
              </Button>
            </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          提交后会显示 LINE：<span className="font-semibold select-all">whx953829</span>，也可直接去 <a className="text-[#FF6F61] underline" href="/contact">联系方式</a>。
        </div>
      </div>
    </div>
  );
} 