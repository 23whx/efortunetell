'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Coffee, Sparkles } from 'lucide-react';
import Button from '@/components/ui/button';

export default function DonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F61] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">返回首页</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-6 shadow-lg">
            <Heart size={40} className="text-white" fill="white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            💖 感谢您的支持
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            您的每一笔捐赠都是对我们最大的鼓励
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 text-white">
            <h2 className="text-2xl font-black mb-4">
              为什么需要您的支持？
            </h2>
            <div className="space-y-3 text-white/90">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>维持服务器运营和AI API调用费用</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>持续创作高质量的命理知识文章</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>开发更多实用的命理工具和功能</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>让免费服务能够持续提供给更多用户</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">
              扫码捐赠任意金额
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* WeChat */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 mb-4 hover:shadow-xl transition-shadow">
                  <div className="w-64 h-64 mx-auto flex items-center justify-center">
                    <img 
                      src="/payQRcode/vxQRcode.png" 
                      alt="微信支付" 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Coffee className="w-5 h-5 text-green-600" />
                  <p className="text-lg font-bold text-gray-900">微信支付</p>
                </div>
              </div>
              
              {/* Alipay */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 mb-4 hover:shadow-xl transition-shadow">
                  <div className="w-64 h-64 mx-auto flex items-center justify-center">
                    <img 
                      src="/payQRcode/zfbQRcode.png" 
                      alt="支付宝" 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Coffee className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-bold text-gray-900">支付宝</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
              <p className="text-center text-gray-700">
                <strong>建议金额：</strong>
                <span className="mx-2">☕ ¥6.8</span>
                <span className="mx-2">🍰 ¥16.8</span>
                <span className="mx-2">🎁 ¥18</span>
                <span className="mx-2">💝 ¥68</span>
              </p>
            </div>

            <div className="bg-pink-50 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                捐赠者的话
              </h4>
              <p className="text-sm text-gray-700 italic">
                "您的慷慨支持让我们能够继续为大家提供免费的命理咨询服务。
                无论金额大小，都是对我们工作的认可和鼓励。
                我们会更加努力，为您带来更好的服务体验！"
              </p>
              <p className="text-sm text-gray-500 mt-3 text-right">
                —— Rolley 敬上
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/ai-chat">
            <Button variant="default" className="w-full py-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200">
              体验AI咨询
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="default" className="w-full py-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200">
              阅读命理文章
            </Button>
          </Link>
          <Link href="/fortune">
            <Button variant="default" className="w-full py-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200">
              深度咨询服务
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

