'use client';
import React, { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
  summary?: string;
  coverImage?: string;
}

interface SharePlatform {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  onClick: () => void;
}

export default function ShareModal({ isOpen, onClose, title, url, description = '', summary = '', coverImage }: ShareModalProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const shareText =
    description ||
    summary ||
    `我在 Rolley 玄学命理小站读到一篇很有意思的文章：《${title}》，分享给你～`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const platforms: SharePlatform[] = [
    {
      name: 'X (Twitter)',
      nameEn: 'X (Twitter)',
      icon: '🐦',
      color: 'bg-black text-white',
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      nameEn: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600 text-white',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
      }
    },
    {
      name: 'Instagram',
      nameEn: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
      onClick: () => {
        // Instagram doesn't support direct URL sharing, so we copy the content
        handleCopyLink();
        alert(language === 'zh' ? 'Instagram 不支持直接分享链接，链接已复制到剪贴板，请手动分享' : 'Instagram does not support direct link sharing. Link copied to clipboard.');
      }
    },
    {
      name: '微信',
      nameEn: 'WeChat',
      icon: '💬',
      color: 'bg-green-500 text-white',
      onClick: () => {
        // 微信分享需要特殊处理，这里先复制链接
        handleCopyLink();
        alert(language === 'zh' ? '微信分享链接已复制到剪贴板，请在微信中粘贴分享' : 'WeChat share link copied to clipboard, please paste in WeChat');
      }
    },
    {
      name: '微信朋友圈',
      nameEn: 'WeChat Moments',
      icon: '🌟',
      color: 'bg-green-600 text-white',
      onClick: () => {
        // 朋友圈分享需要特殊处理，这里先复制链接
        handleCopyLink();
        alert(language === 'zh' ? '朋友圈分享链接已复制到剪贴板，请在微信朋友圈中粘贴分享' : 'WeChat Moments share link copied to clipboard, please paste in WeChat Moments');
      }
    },
    {
      name: '小红书',
      nameEn: 'XiaoHongShu',
      icon: '📖',
      color: 'bg-red-500 text-white',
      onClick: () => {
        // 小红书分享需要特殊处理，这里先复制链接
        handleCopyLink();
        alert(language === 'zh' ? '小红书分享链接已复制到剪贴板，请在小红书App中分享' : 'XiaoHongShu share link copied to clipboard, please share in XiaoHongShu app');
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Share2 size={20} />
            {language === 'zh' ? '分享' : 'Share'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 分享标题 */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">
              {language === 'zh' ? '分享文章' : 'Share Article'}
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {title}
            </p>
          </div>

          {/* 平台列表 */}
          <div className="space-y-3 mb-6">
            <h5 className="font-medium text-gray-700 text-sm">
              {language === 'zh' ? '选择分享平台' : 'Choose Platform'}
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform, index) => (
                <button
                  key={index}
                  onClick={platform.onClick}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105 ${platform.color}`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="font-medium text-sm">
                    {language === 'zh' ? platform.name : platform.nameEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 复制链接 */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-700 text-sm mb-3">
              {language === 'zh' ? '或复制链接' : 'Or Copy Link'}
            </h5>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#FF6F61] text-white hover:bg-[#FF8A75]'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    {language === 'zh' ? '已复制' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {language === 'zh' ? '复制' : 'Copy'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 