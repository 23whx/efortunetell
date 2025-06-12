'use client';
import { useState } from 'react';
import { Copy, Check, Mail, Globe, MessageCircle, Video, Twitter } from 'lucide-react';
import Button from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const contactInfo = {
    name: "Rollkey",
    email: "wanghongxiang23@gmail.com",
    website: "https://bit.ly/m/Rollkey",
    twitter: "@Rollkey4",
    youtube: "https://www.youtube.com/@Rollkey",
    telegram: "https://t.me/Rollkey",
    wechat: t('contact.wechatSecret')
  };

  const CopyButton = ({ text, field, icon }: { text: string; field: string; icon: React.ReactNode }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 h-8 px-2"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] to-[#F5F5DC] p-8">
      <div className="max-w-2xl mx-auto">
        {/* 头部标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FF6F61] mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-gray-600">{t('contact.subtitle')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('contact.primaryContact')}: X (Twitter) & Telegram</p>
        </div>

        {/* 主要内容卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* 头像和介绍 */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#FF6F61] shadow-lg">
              <img 
                src="/admin_img.jpg" 
                alt="Rollkey"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23FF6F61'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dy='.3em'%3ERK%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{contactInfo.name}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('contact.description')}
            </p>
            <p className="text-gray-600 leading-relaxed mt-2">
              {t('contact.specialization')}
            </p>
          </div>

          {/* 联系方式 */}
          <div className="space-y-6">
            {/* X (Twitter) - 常用联系方式 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <div className="flex items-center">
                <Twitter className="h-6 w-6 text-[#FF6F61] mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{t('contact.twitter')} ⭐ {t('contact.primaryContact')}</p>
                  <a 
                    href={`https://x.com/${contactInfo.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    {contactInfo.twitter}
                  </a>
                </div>
              </div>
            </div>

            {/* Telegram - 常用联系方式 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 text-[#FF6F61] mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{t('contact.telegram')} ⭐ {t('contact.primaryContact')}</p>
                  <a 
                    href={contactInfo.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    @Rollkey
                  </a>
                </div>
              </div>
              <CopyButton text={contactInfo.telegram} field="telegram" icon={<MessageCircle />} />
            </div>

            {/* 邮箱 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-[#FF6F61] mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{t('contact.email')}</p>
                  <p className="text-gray-600">{contactInfo.email}</p>
                </div>
              </div>
              <CopyButton text={contactInfo.email} field="email" icon={<Mail />} />
            </div>

            {/* 网站 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Globe className="h-6 w-6 text-[#FF6F61] mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{t('contact.website')}</p>
                  <a 
                    href={contactInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {contactInfo.website}
                  </a>
                </div>
              </div>
            </div>

            {/* YouTube */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Video className="h-6 w-6 text-[#FF6F61] mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{t('contact.youtube')}</p>
                  <a 
                    href={contactInfo.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {contactInfo.name} Channel
                  </a>
                </div>
              </div>
            </div>

            {/* 微信 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-75">
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-600">{t('contact.wechat')}</p>
                  <p className="text-gray-500 italic">{contactInfo.wechat}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm text-center">
              {t('contact.thankYou')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 