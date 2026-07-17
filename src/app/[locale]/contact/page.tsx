'use client';
import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Mail, 
  MessageSquare, 
  Twitter, 
  Send, 
  Youtube, 
  Globe, 
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Zap,
  Award
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#faf9f6] selection:bg-[#FF6F61]/20">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF6F61]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF6F61]/5 blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <ShieldCheck size={12} className="stroke-[3]" />
            {t('contact.consultant')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-16 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Zap size={240} className="text-[#FF6F61]" />
          </div>
          
          <div className="relative flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6F61] to-[#FF6F61]/20 blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-2 bg-white border border-gray-100 shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Image 
                    src="/admin_img.jpg" 
                    alt="Rollkey"
                    width={200}
                    height={200}
                    className="w-full h-full object-cover scale-110"
                    unoptimized={true}
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 transform rotate-12">
                <Award size={28} className="text-[#FF6F61] stroke-[2.5]" />
              </div>
            </div>

            <div className="text-center max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Rollkey</h2>
              <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
                {t('contact.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {t('contact.specialization').split(' ').map((spec, i) => (
                  <span key={i} className="px-4 py-2 rounded-2xl bg-gray-50 text-gray-500 text-[11px] font-black uppercase tracking-wider border border-gray-100">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Primary Connection */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">
              {t('contact.primaryContact')}
            </h3>
            
            {/* LINE */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#FF6F61]/5 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 rounded-3xl bg-[#06C755]/10 flex items-center justify-center text-[#06C755]">
                  <MessageCircle size={32} className="stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#06C755]/10 text-[#06C755] text-[10px] font-black uppercase tracking-widest">
                  {t('contact.recommended')}
                </span>
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">LINE</h4>
              <p className="text-sm text-gray-500 font-medium mb-6">{t('contact.primaryChannel')}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-gray-900 tracking-wider text-center select-all group-hover:bg-[#06C755]/5 group-hover:border-[#06C755]/20 transition-colors">
                  whx953829
                </div>
              </div>
            </div>

            {/* Twitter */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#FF6F61]/5 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 rounded-3xl bg-black flex items-center justify-center text-white">
                  <Twitter size={32} className="stroke-[2]" />
                </div>
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('contact.twitter')}</h4>
              <p className="text-sm text-gray-500 font-medium mb-6">{t('contact.fastestResponse')}</p>
              <a 
                href="https://x.com/Rollkey4" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-black text-white rounded-2xl p-4 font-black tracking-wider text-center hover:opacity-90 transition-opacity"
              >
                <span className="flex-1 text-center">@Rollkey4</span>
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Secondary Connections */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">
              {t('contact.secondaryContact')}
            </h3>

            {/* Email */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6F61]/10 group-hover:text-[#FF6F61] transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">{t('contact.email')}</h4>
                  <a href="mailto:wanghongxiang23@gmail.com" className="text-sm text-gray-500 hover:text-[#FF6F61] transition-colors font-medium">
                    wanghongxiang23@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Telegram */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0088cc]/10 group-hover:text-[#0088cc] transition-colors">
                  <Send size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">Telegram</h4>
                  <a href="https://t.me/Rollkey" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#0088cc] transition-colors font-medium">
                    @Rollkey
                  </a>
                </div>
              </div>
            </div>

            {/* YouTube */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF0000]/10 group-hover:text-[#FF0000] transition-colors">
                  <Youtube size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">YouTube</h4>
                  <a href="https://www.youtube.com/@Rollkey" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#FF0000] transition-colors font-medium">
                    @Rollkey
                  </a>
                </div>
              </div>
            </div>

            {/* Website */}
            <div className="group bg-white rounded-[40px] border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF6F61]/10 group-hover:text-[#FF6F61] transition-colors">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">{t('contact.website')}</h4>
                  <a href="https://bit.ly/m/Rollkey" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#FF6F61] transition-colors font-medium">
                    bit.ly/m/Rollkey
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            {t('contact.worldwide')}
          </p>
          <div className="inline-flex items-center gap-2 text-[#FF6F61]">
            <Zap size={16} fill="currentColor" />
            <span className="font-black italic text-sm tracking-wider">{t('contact.brand')}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
