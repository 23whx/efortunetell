"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { API_BASE_URL } from '@/config/api';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  fallbackSize?: { width: number, height: number };
}

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc = '/qrcode.png',  // 使用前端public目录中的可靠图片作为占位图（当后端图片加载失败时显示）
  fallbackSize = { width: 300, height: 200 },
  width = 600,
  height = 400,
  ...rest
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 当src属性变化时重置状态
    setImgSrc(src);
    setError(false);
    setLoading(true);
  }, [src]);

  // 处理图片路径，主要是将相对路径转换为后端API完整路径
  const handleSrc = (imageSrc: string): string => {
    if (!imageSrc) return fallbackSrc;
    
    // 如果已经是完整URL (包括API_BASE_URL的图片)，直接返回
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // 对于前端public目录中的静态文件（用作占位图等）
    if (imageSrc.startsWith('/') && !imageSrc.startsWith('/images/')) {
      return imageSrc;
    }
    
    // 对于/images/路径的图片，添加API_BASE_URL以访问后端图片
    if (imageSrc.startsWith('/images/')) {
      return `${API_BASE_URL}${imageSrc}`;
    }
    
    // 其他情况，假设是后端图片的文件名，构建完整URL
    return `${API_BASE_URL}/images/${imageSrc}`;
  };

  const handleError = () => {
    console.log(`图片加载失败: ${imgSrc}`);
    
    // 避免无限循环
    if (imgSrc === fallbackSrc) {
      setLoading(false);
      return;
    }
    
    setError(true);
    setImgSrc(fallbackSrc);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // 处理图片路径，将相对路径转换为完整URL
  const processedSrc = error ? fallbackSrc : handleSrc(imgSrc);
  const imgWidth = error ? fallbackSize.width : width;
  const imgHeight = error ? fallbackSize.height : height;

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">加载中...</span>
        </div>
      )}
      <Image
        src={processedSrc}
        alt={alt || '图片'}
        width={imgWidth}
        height={imgHeight}
        onError={handleError}
        onLoad={handleLoad}
        style={{ 
          objectFit: 'cover', 
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          ...rest.style 
        }}
        unoptimized={true}
        {...rest}
      />
    </div>
  );
};

export default ImageWithFallback; 