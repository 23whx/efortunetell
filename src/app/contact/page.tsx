'use client';
import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] via-[#FFF8DC] to-[#F5F5DC] p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#FF6F61] mb-6 tracking-wide">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FF6F61] to-[#ff8a75] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* 主要内容卡片 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20">
          {/* 个人信息区域 */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-[#FF6F61] shadow-xl ring-4 ring-[#FF6F61]/20">
                <Image 
                  src="/admin_img.jpg" 
                  alt="Rollkey"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FF6F61] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">✨</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Rollkey</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-2">
              {t('contact.description')}
            </p>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              {t('contact.specialization')}
            </p>
          </div>

          {/* 常用联系方式 */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">主要联系方式</h3>
              <p className="text-gray-600">推荐使用以下方式快速联系</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* X (Twitter) - 主推 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-orange-100 to-red-100 p-8 rounded-2xl text-center transform group-hover:scale-105 transition-all duration-300 shadow-xl border border-orange-200/50">
                  <div className="text-5xl mb-4">🐦</div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2 text-orange-800">
                    X (Twitter) 
                    <span className="text-yellow-500">⭐</span>
                  </h3>
                  <p className="text-orange-700 mb-4">最快响应渠道</p>
                  <a 
                    href="https://x.com/Rollkey4" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-orange-200 hover:bg-orange-300 text-orange-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    @Rollkey4
                  </a>
                </div>
              </div>

              {/* Telegram */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-100 to-indigo-100 p-8 rounded-2xl text-center transform group-hover:scale-105 transition-all duration-300 shadow-xl border border-blue-200/50">
                  <div className="text-5xl mb-4">✈️</div>
                  <h3 className="text-2xl font-bold mb-2 text-blue-800">Telegram</h3>
                  <p className="text-blue-700 mb-4">即时通讯</p>
                  <a 
                    href="https://t.me/Rollkey" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-200 hover:bg-blue-300 text-blue-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    @Rollkey
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 其他联系方式 */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">其他联系方式</h3>
              <p className="text-gray-600">更多沟通渠道</p>
            </div>
            
            {/* Email 单独一行，更宽 */}
            <div className="mb-6">
              <div className="max-w-2xl mx-auto">
                <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-green-200/50">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📧</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
                  <p className="text-gray-500 mb-4">邮件联系</p>
                  <a 
                    href="mailto:wanghongxiang23@gmail.com" 
                    className="text-green-600 hover:text-green-700 font-medium transition-colors duration-300 text-lg"
                  >
                    wanghongxiang23@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* 其他三个联系方式 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Website */}
              <div className="group bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-gray-200/50">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌐</div>
                <h3 className="font-bold text-gray-800 mb-2">Website</h3>
                <p className="text-gray-500 text-sm mb-4">官方网站</p>
                <a 
                  href="https://bit.ly/m/Rollkey" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF6F61] hover:text-[#ff8a75] font-medium transition-colors duration-300 text-sm break-all"
                >
                  bit.ly/m/Rollkey
                </a>
              </div>

              {/* YouTube */}
              <div className="group bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-red-200/50">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📺</div>
                <h3 className="font-bold text-gray-800 mb-2">YouTube</h3>
                <p className="text-gray-500 text-sm mb-4">视频内容</p>
                <a 
                  href="https://www.youtube.com/@Rollkey" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 font-medium transition-colors duration-300 text-sm"
                >
                  @Rollkey
                </a>
              </div>

              {/* WeChat */}
              <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-yellow-200/50">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
                <h3 className="font-bold text-gray-800 mb-2">WeChat</h3>
                <p className="text-gray-500 text-sm mb-4">微信</p>
                <span className="text-gray-400 text-sm">{t('contact.wechatSecret')}</span>
              </div>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl text-center border border-blue-200/50">
            <div className="max-w-2xl mx-auto">
              <div className="text-4xl mb-4">🙏</div>
              <p className="text-blue-800 text-lg font-medium mb-4">
                {t('contact.thankYou')}
              </p>
              <div className="inline-flex items-center gap-2 bg-blue-100 px-6 py-3 rounded-full">
                <span className="text-2xl">⚡</span>
                <span className="text-blue-700 font-medium">
                  推荐：X (Twitter) @Rollkey4 & Telegram @Rollkey
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 