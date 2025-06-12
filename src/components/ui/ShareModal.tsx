'use client';
import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  url: string;
  coverImage?: string;
}

interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (title: string, summary: string, url: string) => string;
}

const sharePlatforms: SharePlatform[] = [
  {
    name: '微信',
    icon: '💬',
    color: '#07C160',
    shareUrl: (title, summary, url) => url
  },
  {
    name: '微博',
    icon: '🔥',
    color: '#E6162D',
    shareUrl: (title, summary, url) => 
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title + ' - ' + summary)}`
  },
  {
    name: '知乎',
    icon: '🧠',
    color: '#0084FF',
    shareUrl: (title, summary, url) => 
      `https://www.zhihu.com/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: '豆瓣',
    icon: '📚',
    color: '#00B51D',
    shareUrl: (title, summary, url) => 
      `https://www.douban.com/share/service?href=${encodeURIComponent(url)}&name=${encodeURIComponent(title)}&text=${encodeURIComponent(summary)}`
  },
  {
    name: '小红书',
    icon: '📝',
    color: '#FF2442',
    shareUrl: (title, summary, url) => url
  },
  {
    name: 'QQ空间',
    icon: '🌟',
    color: '#FFCE00',
    shareUrl: (title, summary, url) => 
      `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    shareUrl: (title, summary, url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ' - ' + summary)}`
  },
  {
    name: 'Twitter/X',
    icon: '🐦',
    color: '#1DA1F2',
    shareUrl: (title, summary, url) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' - ' + summary)}&url=${encodeURIComponent(url)}`
  },
  {
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    shareUrl: (title, summary, url) => url
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    shareUrl: (title, summary, url) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    shareUrl: (title, summary, url) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + ' - ' + summary)}`
  },
  {
    name: 'WhatsApp',
    icon: '💚',
    color: '#25D366',
    shareUrl: (title, summary, url) => 
      `https://wa.me/?text=${encodeURIComponent(title + ' - ' + summary + ' ' + url)}`
  }
];

export default function ShareModal({ isOpen, onClose, title, summary, url, coverImage }: ShareModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    // 检查是否支持原生分享
    setHasNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  if (!isOpen) return null;

  const handlePlatformShare = (platform: SharePlatform) => {
    if (platform.name === '微信' || platform.name === '小红书' || platform.name === 'Instagram') {
      // 这些平台主要通过复制链接分享
      handleCopyLink();
      return;
    }

    const shareUrl = platform.shareUrl(title, summary, url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleNativeShare = async () => {
    if (hasNativeShare && navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">分享文章</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 文章预览 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex space-x-3">
            {coverImage && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{title}</h4>
              <p className="text-sm text-gray-600 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{summary}</p>
            </div>
          </div>
        </div>

        {/* 分享平台 */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {sharePlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handlePlatformShare(platform)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* 复制链接 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">{url}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">复制链接</span>
                  </>
                )}
              </button>
            </div>

            {/* 系统分享 */}
            {hasNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                使用系统分享
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 