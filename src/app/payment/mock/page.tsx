'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import Button from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [order, setOrder] = useState<any>(null);
  
  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);
  
  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/payment/check-status?orderId=${orderId}`);
      const data = await response.json();
      setOrder(data);
      if (data.status === 'paid') {
        setPaid(true);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  };
  
  const handleMockPayment = async () => {
    setLoading(true);
    try {
      // 模拟支付：直接更新订单状态为已支付
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('payment_orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          trade_no: `MOCK_${Date.now()}`,
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setPaid(true);
      
      // 3秒后跳转
      setTimeout(() => {
        router.push('/ai-chat');
      }, 3000);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">订单ID缺失</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            返回首页
          </Button>
        </div>
      </div>
    );
  }
  
  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            支付成功！
          </h1>
          <p className="text-gray-600 mb-2">订单号：{order?.orderNo}</p>
          <p className="text-gray-600 mb-6">支付金额：¥{order?.amount}</p>
          <p className="text-sm text-gray-500">
            即将跳转到AI咨询页面...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-black text-gray-900 mb-6 text-center">
          模拟支付
        </h1>
        
        <div className="bg-gray-50 p-6 rounded-2xl mb-6">
          <p className="text-sm text-gray-500 mb-2">订单号</p>
          <p className="text-lg font-bold text-gray-900 mb-4">{order?.orderNo}</p>
          
          <p className="text-sm text-gray-500 mb-2">支付金额</p>
          <p className="text-3xl font-black text-[#FF6F61] mb-4">
            ¥{order?.amount}
          </p>
          
          <p className="text-xs text-gray-400">
            * 这是模拟支付环境，点击按钮即可完成支付
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleMockPayment}
            disabled={loading}
            className="w-full py-4 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              '确认支付'
            )}
          </Button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-4 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            取消支付
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-6">
          真实环境将使用支付宝/微信支付
        </p>
      </div>
    </div>
  );
}

