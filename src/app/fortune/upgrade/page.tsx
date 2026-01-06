'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import Button from '@/components/ui/button';
import { ArrowLeft, Sparkles, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('consultationId');
  
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async () => {
    if (!userName || !userContact) {
      alert('请填写姓名和联系方式');
      return;
    }
    
    if (!consultationId) {
      alert('咨询ID缺失');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          userName,
          userContact,
          requirements,
        }),
      });
      
      const data = await response.json();
      if (data.appointmentId) {
        setSubmitted(true);
      } else {
        alert('提交失败，请重试');
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            预约提交成功！
          </h1>
          <p className="text-gray-600 mb-8">
            您的预约已经发送到后台，老师会尽快联系您进行深度咨询。
            请保持联系方式畅通。
          </p>
          <div className="space-y-3">
            <Link href="/fortune">
              <Button className="w-full py-4">
                查看算命服务详情
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 text-gray-600 hover:text-gray-900 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] via-[#FFF5E1] to-[#FFFACD] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/ai-chat"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F61] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">返回AI咨询</span>
        </Link>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF6F61] to-[#FF8A7A] p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6">
              <Sparkles size={40} />
            </div>
            <h1 className="text-3xl font-black mb-4">
              升级到深度咨询服务
            </h1>
            <p className="text-white/90 text-lg">
              一对一专业咨询，更深入、更全面的命理解读
            </p>
          </div>
          
          {/* Features */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-6">深度咨询服务特色</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">一对一深度解读</p>
                  <p className="text-sm text-gray-600">老师本人亲自分析，更专业更深入</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">理论原理讲解</p>
                  <p className="text-sm text-gray-600">详细解释命理原理，教你看懂自己的命盘</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">针对性建议</p>
                  <p className="text-sm text-gray-600">根据你的具体情况提供实用的改运方法</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">长期跟踪指导</p>
                  <p className="text-sm text-gray-600">可持续咨询，陪伴你的人生重要阶段</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">填写预约信息</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  您的姓名 *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none transition-all"
                  placeholder="请输入真实姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  联系方式 *
                </label>
                <input
                  type="text"
                  value={userContact}
                  onChange={(e) => setUserContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none transition-all"
                  placeholder="手机号或微信号"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  咨询需求（选填）
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none transition-all"
                  rows={4}
                  placeholder="详细描述您想深入了解的问题..."
                />
              </div>
            </div>
            
            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <p className="text-sm text-gray-700">
                <strong>说明：</strong>提交预约后，您的AI咨询记录和八字信息会一并发送给老师。
                老师会通过您留下的联系方式与您沟通具体的咨询安排和费用。
              </p>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={loading || !userName || !userContact}
              className="w-full py-4 text-lg mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  提交预约
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

