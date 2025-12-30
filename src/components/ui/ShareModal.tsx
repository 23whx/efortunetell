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
  id: string;
  nameKey: string;
  icon: string;
  color: string;
  onClick: (t: (key: string) => string, handleCopy: () => Promise<void>) => void;
}

export default function ShareModal({ isOpen, onClose, title, url, description = '', summary = '', coverImage }: ShareModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareText =
    description ||
    summary ||
    t('share.defaultText').replace('{title}', title);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const platforms: SharePlatform[] = [
    {
      id: 'x',
      nameKey: 'X (Twitter)',
      icon: '🐦',
      color: 'bg-black text-white',
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
      }
    },
    {
      id: 'facebook',
      nameKey: 'share.facebook',
      icon: '📘',
      color: 'bg-blue-600 text-white',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
      }
    },
    {
      id: 'instagram',
      nameKey: 'share.instagram',
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
      onClick: (t, handleCopy) => {
        handleCopy();
        alert(t('share.instagramHint'));
      }
    },
    {
      id: 'wechat',
      nameKey: 'share.wechat',
      icon: '💬',
      color: 'bg-green-500 text-white',
      onClick: (t, handleCopy) => {
        handleCopy();
        alert(t('share.wechatHint'));
      }
    },
    {
      id: 'wechatMoments',
      nameKey: 'share.wechatMoments',
      icon: '🌟',
      color: 'bg-green-600 text-white',
      onClick: (t, handleCopy) => {
        handleCopy();
        alert(t('share.wechatMomentsHint'));
      }
    },
    {
      id: 'xiaohongshu',
      nameKey: 'share.xiaohongshu',
      icon: '📖',
      color: 'bg-red-500 text-white',
      onClick: (t, handleCopy) => {
        handleCopy();
        alert(t('share.xiaohongshuHint'));
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Share2 size={20} />
            {t('share.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Share Title */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">
              {t('share.article')}
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {title}
            </p>
          </div>

          {/* Platform List */}
          <div className="space-y-3 mb-6">
            <h5 className="font-medium text-gray-700 text-sm">
              {t('share.choosePlatform')}
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => platform.onClick(t, handleCopyLink)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105 ${platform.color}`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="font-medium text-sm">
                    {t(platform.nameKey) !== platform.nameKey ? t(platform.nameKey) : platform.nameKey}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-700 text-sm mb-3">
              {t('share.copyLink')}
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
                    {t('share.copied')}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {t('share.copy')}
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
