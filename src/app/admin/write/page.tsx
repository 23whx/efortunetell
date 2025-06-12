"use client";
import { useState, useRef, useEffect } from "react";
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { SketchPicker, ColorResult } from 'react-color';
import React from "react";
import { API_BASE_URL } from '@/config/api';

export default function AdminWritePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("其他");
  const [isPaid, setIsPaid] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("'Microsoft YaHei', '微软雅黑', Arial, sans-serif");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());
  const [cover, setCover] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontColor, setFontColor] = useState('#222222');
  const [imageHashes, setImageHashes] = useState<Map<string, string>>(new Map());

  // 计算图片hash
  const getImageHash = async (file: File): Promise<string> => {
    try {
      if (!file) return '';
      
      // 检查crypto API是否可用
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API 不可用，使用备用方法');
        return Date.now() + '-' + Math.random().toString(36).substring(2, 15);
      }
      
      const arrayBuffer = await file.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) return '';
      
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      if (!hashBuffer) return '';
      
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('计算图片哈希错误:', error);
      return Date.now() + '-' + Math.random().toString(36).substring(2, 15); // 出错时返回随机字符串作为备用哈希
    }
  };

  // 批量上传图片到前端静态资源目录，返回 url 数组
  const uploadImagesToServer = async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('image', file));
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`图片上传失败: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          return data.data.map((item: any) => item.url);
        } else if (data.data.url) {
          return [data.data.url];
        }
      }
      throw new Error('图片上传返回数据格式错误');
    } catch (error) {
      console.error('图片上传错误:', error);
      throw error;
    }
  };

  // 处理粘贴事件，支持粘贴图片（带查重）
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const textarea = contentRef.current;
      if (!textarea) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (!blob) continue;
          const hash = await getImageHash(blob);
          if (imageHashes.has(hash)) {
            const existUrl = imageHashes.get(hash)!;
            const reuse = window.confirm('检测到重复图片，点击"确定"复用已存在图片，点击"取消"覆盖（删除原图片并用新图片）');
            if (reuse) {
              setImages(prev => [...prev, existUrl]);
              insertImageToContent(existUrl);
              break;
            } else {
              setImages(prev => prev.filter(url => url !== existUrl));
              setImageFiles(prev => { const m = new Map(prev); m.delete(existUrl); return m; });
              URL.revokeObjectURL(existUrl);
              setImageHashes(prev => { const m = new Map(prev); m.delete(hash); return m; });
            }
          }
          // 新图片
          const blobUrl = URL.createObjectURL(blob);
          setImages(prev => [...prev, blobUrl]);
          setImageFiles(prev => { const m = new Map(prev); m.set(blobUrl, blob); return m; });
          setImageHashes(prev => { const m = new Map(prev); m.set(hash, blobUrl); return m; });
          insertImageToContent(blobUrl);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => { document.removeEventListener('paste', handlePaste); };
  }, [imageHashes, imageFiles]);

  // 处理图片上传（带查重）
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      const newImages: string[] = [];
      const newImageFiles = new Map(imageFiles);
      const newImageHashes = new Map(imageHashes);
      
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          if (!file) continue;
          
          // 安全地计算哈希，确保即使失败也不会中断整个流程
          let hash = '';
          try {
            hash = await getImageHash(file);
          } catch (hashError) {
            console.error('哈希计算失败:', hashError);
            hash = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
          }
          
          // 处理重复图片
          if (hash && newImageHashes.has(hash)) {
            const existUrl = newImageHashes.get(hash)!;
            const reuse = window.confirm('检测到重复图片，点击"确定"复用已存在图片，点击"取消"覆盖（删除原图片并用新图片）');
            if (reuse) {
              // 复用：直接用已存在图片
              newImages.push(existUrl);
              continue;
            } else {
              // 覆盖：删除原图片
              setImages(prev => prev.filter(url => url !== existUrl));
              newImageFiles.delete(existUrl);
              URL.revokeObjectURL(existUrl);
              newImageHashes.delete(hash);
            }
          }
          
          // 创建blob URL
          let blobUrl;
          try {
            blobUrl = URL.createObjectURL(file);
          } catch (blobError) {
            console.error('创建Blob URL失败:', blobError);
            continue; // 跳过这个文件
          }
          
          // 添加新图片
          newImages.push(blobUrl);
          newImageFiles.set(blobUrl, file);
          newImageHashes.set(hash, blobUrl);
        } catch (fileError) {
          console.error('处理单个文件时出错:', fileError);
          // 继续处理下一个文件
        }
      }
      
      // 更新状态
      setImages(prev => [...prev, ...newImages]);
      setImageFiles(newImageFiles);
      setImageHashes(newImageHashes);
      
      // 如果只上传了一张图片，自动插入到内容中
      if (newImages.length === 1) {
        insertImageToContent(newImages[0]);
      }
      
      // 清空文件输入框，允许再次选择相同的文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('图片上传过程中发生错误:', error);
      alert('图片上传失败，请重试。');
      
      // 确保文件输入框被清空
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };

  // 富文本操作
  const insertAround = (before: string, after: string = before) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newText = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };
  
  const insertColor = (color: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const colorTag = `<span style=\"color:${color}\">${selected}</span>`;
    const newText = content.slice(0, start) + colorTag + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + colorTag.length, start + colorTag.length);
    }, 0);
  };
  
  // 插入图片到文章内容
  const insertImageToContent = (imgUrl: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const imageTag = `\n<img src="${imgUrl}" alt="文章图片" style="max-width: 100%; height: auto;" />\n`;
    const newText = content.slice(0, start) + imageTag + content.slice(start);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + imageTag.length, start + imageTag.length);
    }, 0);
  };

  // 上传所有临时图片并获取服务器URL（多图批量上传）
  const uploadAllImages = async (): Promise<Map<string, string>> => {
    const urlMap = new Map<string, string>();
    const failedUploads: string[] = [];
    const blobs: string[] = [];
    const files: File[] = [];
    for (const [blobUrl, file] of imageFiles.entries()) {
      blobs.push(blobUrl);
      files.push(file);
    }
    try {
      const urls = await uploadImagesToServer(files);
      blobs.forEach((blobUrl, idx) => {
        if (urls[idx]) {
          urlMap.set(blobUrl, urls[idx]);
        } else {
          failedUploads.push(blobUrl);
          if (cover === blobUrl) setCover(null);
        }
      });
    } catch (error) {
      blobs.forEach(blobUrl => {
        failedUploads.push(blobUrl);
        if (cover === blobUrl) setCover(null);
      });
    }
    // 过滤掉上传失败的图片
    if (failedUploads.length > 0) {
      setImages(prev => prev.filter(url => !failedUploads.includes(url)));
      const newImageFiles = new Map(imageFiles);
      failedUploads.forEach(blobUrl => {
        newImageFiles.delete(blobUrl);
        URL.revokeObjectURL(blobUrl);
      });
      setImageFiles(newImageFiles);
    }
    return urlMap;
  };

  // 替换内容中的临时URL为服务器URL，并标准化为/images/xxx.jpg
  const replaceContentUrls = (content: string, urlMap: Map<string, string>): string => {
    let newContent = content;
    urlMap.forEach((serverUrl, blobUrl) => {
      let normalized = serverUrl;
      if (serverUrl && serverUrl.includes('/images/')) {
        const fileName = serverUrl.split('/').pop();
        normalized = `/images/${fileName}`;
      }
      const regex = new RegExp(blobUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      newContent = newContent.replace(regex, normalized);
    });
    // 移除所有blob:图片
    newContent = newContent.replace(/<img[^>]*src=["']blob:[^"']+["'][^>]*>/g, '');
    return newContent;
  };

  const generateSlug = (text: string): string => {
    // 生成基本slug
    let slug = text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '') // 移除非单词字符
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    // 确保slug不为空
    if (!slug || slug.length === 0) {
      // 如果slug为空（可能是因为标题只包含特殊字符），生成一个随机slug
      slug = 'article-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 6);
      console.log('生成随机slug:', slug, '，原标题:', text);
    }
      
    return slug;
  };

  // 提取图片路径中的文件名，确保使用相对URL格式
  const normalizeImagePath = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('blob:')) return '';
    if (path.startsWith('/images/') || path.startsWith('/uploads/') || path.startsWith('http')) return path;
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { alert('标题不能为空'); return; }
    if (!content) { alert('内容不能为空'); return; }
    if (submitting) { alert('正在提交中，请稍候...'); return; }
    
    setSubmitting(true);
    
    try {
      // 处理图像上传
      const imageResult = await (async () => {
        if (imageFiles.size === 0) {
          return { 
            finalContent: content,
            finalImages: images,
            finalCover: cover 
          };
        }
        
        try {
          const urlMap = await uploadAllImages();
          return {
            finalContent: replaceContentUrls(content, urlMap),
            finalImages: images.map(url => urlMap.get(url) || url).filter(Boolean),
            finalCover: cover ? (urlMap.get(cover) || cover) : null
          };
        } catch (err) {
          console.error('图片上传错误:', err);
          if (window.confirm('图片上传失败，是否继续提交（文章中将不包含图片）？')) {
            return { 
              finalContent: content,
              finalImages: [],
              finalCover: null 
            };
          } else {
            throw new Error('用户取消了文章提交');
          }
        }
      })();
      
      // 准备文章标签数据
      const tagList = tags.split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // 标准化图片路径 - 修复后的逻辑
      console.log('【DEBUG】开始标准化图片路径，原始图片数组:', imageResult.finalImages);
      const normalizedImages = imageResult.finalImages
        .map(img => {
          console.log('【DEBUG】处理图片路径:', img);
          if (!img || typeof img !== 'string') {
            console.log('【DEBUG】图片路径为空或非字符串:', img);
            return '';
          }
          if (img.startsWith('blob:')) {
            console.log('【DEBUG】跳过blob URL:', img);
            return '';
          }
          
          // 如果已经是正确的/images/格式
          if (img.startsWith('/images/')) {
            console.log('【DEBUG】已是正确格式:', img);
            return img;
          }
          
          // 如果包含images路径，提取文件名
          if (img.includes('/images/')) {
            const fileName = img.split('/images/')[1];
            if (fileName && fileName.trim()) {
              const result = `/images/${fileName}`;
              console.log('【DEBUG】从完整URL提取:', img, '->', result);
              return result;
            }
          }
          
          // 如果是完整的服务器URL，提取文件名
          if (img.startsWith('http')) {
            const fileName = img.split('/').pop();
            if (fileName && fileName.trim() && !fileName.includes('?')) {
              const result = `/images/${fileName}`;
              console.log('【DEBUG】从HTTP URL提取:', img, '->', result);
              return result;
            }
          }
          
          // 如果直接是文件名
          if (img && !img.includes('/') && img.includes('.')) {
            const result = `/images/${img}`;
            console.log('【DEBUG】直接是文件名:', img, '->', result);
            return result;
          }
          
          console.log('【DEBUG】无法处理的图片路径:', img);
          return '';
        })
        .filter(path => path && path !== '' && path !== '/images/');
      
      console.log('【DEBUG】标准化后的图片数组:', normalizedImages);
      
      // 处理封面图片
      const normalizedCover = imageResult.finalCover && !imageResult.finalCover.startsWith('blob:') ? (imageResult.finalCover.includes('/images/') ? `/images/${imageResult.finalCover.split('/').pop()}` : `/images/${imageResult.finalCover.split('/').pop()}`) : '';
      
      // 处理封面图片
      const coverImage = normalizedCover ? (
        normalizedCover.startsWith('/images/') || normalizedCover.startsWith('http') ? 
        normalizedCover : 
        normalizedCover.includes('/images/') ? 
        `/images/${normalizedCover.split('/').pop()}` : 
        null
      ) : null;
      
      // 构建请求对象，恢复 slug 字段，使用 generateSlug(title)
      const rawData = {
        title: title.trim(),
        content: imageResult.finalContent,
        summary: summary.trim(),
        category: category,
        tags: tagList,
        isPaid: isPaid,
        images: normalizedImages,
        slug: generateSlug(title)
      };
      if (coverImage) {
        (rawData as any).coverImage = coverImage;
      }
      // 获取认证Token
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      if (!admin.token) {
        throw new Error('未登录或登录已过期');
      }
      // 打印提交数据
      console.log('【DEBUG】提交数据对象:', rawData);
      const jsonString = JSON.stringify(rawData);
      console.log('【DEBUG】最终JSON字符串:', jsonString);
      // 打印headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${admin.token}`
      };
      console.log('【DEBUG】请求headers:', headers);
      // 发送请求
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'POST',
        headers,
        body: jsonString
      });
      // 打印响应状态和内容
      console.log('【DEBUG】响应状态:', response.status);
      const responseText = await response.text();
      console.log('【DEBUG】响应内容:', responseText);
      let responseData = null;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('【DEBUG】响应内容不是JSON:', responseText);
      }
      
      if (!response.ok) {
        // 处理服务器错误
        if (response.status === 401 || response.status === 403) {
          throw new Error('授权失败，请重新登录');
        } else if (response.status === 500) {
          throw new Error(`服务器内部错误: ${responseData?.message || responseText || '未知错误'}`);
        } else {
          throw new Error(`API错误(${response.status}): ${responseData?.message || responseText || response.statusText}`);
        }
      }
      
      // 6. 处理成功响应
      if (responseData?.success) {
        // 清理本地临时图片
        images.forEach(url => { 
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        // 清理前端临时图片目录（确保目录清洁）
        try {
          const cleanupResponse = await fetch('/api/temp-cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          const cleanupResult = await cleanupResponse.json();
          if (cleanupResult.success) {
            console.log('✅ 临时图片目录清理成功:', cleanupResult.message);
          } else {
            console.warn('⚠️ 临时图片目录清理失败:', cleanupResult.message);
          }
        } catch (cleanupError) {
          console.warn('⚠️ 临时图片目录清理出错:', cleanupError);
          // 清理失败不影响主流程，只记录警告
        }
        
        alert('文章发布成功！');
        router.push('/admin/articles');
      } else {
        throw new Error(`发布失败: ${responseData?.message || '服务器返回了成功状态，但响应格式不正确'}`);
      }
    } catch (err) {
      console.error('文章提交错误:', err);
      alert(`发布失败: ${err instanceof Error ? err.message : '网络错误，请稍后重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 删除图片
  const handleDeleteImage = (imgUrl: string) => {
    // 添加确认对话框
    const confirmDelete = window.confirm("确定要删除图片吗？");
    if (!confirmDelete) {
      console.log('用户取消了删除图片操作');
      return;
    }
    
    // 从图片列表中删除
    setImages(prev => prev.filter(url => url !== imgUrl));
    
    // 如果是临时图片，从图片文件映射中删除
    if (imageFiles.has(imgUrl)) {
      const newImageFiles = new Map(imageFiles);
      newImageFiles.delete(imgUrl);
      setImageFiles(newImageFiles);
      
      // 释放blob URL
      URL.revokeObjectURL(imgUrl);
    }
    
    // 如果是封面图片，清除封面
    if (cover === imgUrl) {
      setCover(null);
    }
    
    // 从文章内容中删除该图片
    const imgTag = new RegExp(`<img[^>]*src=["']${imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
    setContent(content.replace(imgTag, ''));
  };

  // 监听文章内容变化，检测删除的图片
  useEffect(() => {
    // 从内容中提取所有图片URL
    const imgUrlsInContent: string[] = [];
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      imgUrlsInContent.push(match[1]);
    }
    
    // 找出内容中不存在的图片，提示用户是否需要删除
    const checkImagesInContent = () => {
      // 保存不在内容中的图片
      const imagesNotInContent = images.filter(imgUrl => 
        !imgUrlsInContent.includes(imgUrl) && cover !== imgUrl
      );
      
      // 如果有不在内容中的图片且不是封面图片，询问用户是否删除
      if (imagesNotInContent.length > 0) {
        // 不直接删除，而是在控制台记录
        console.log(`有 ${imagesNotInContent.length} 张图片不在内容中且不是封面：`, imagesNotInContent);
        // 注释掉自动删除的代码，由用户手动管理
        // imagesNotInContent.forEach(imgUrl => {
        //   setTimeout(() => {
        //     handleDeleteImage(imgUrl);
        //   }, 0);
        // });
      }
    };
    
    // 使用防抖处理，避免频繁触发
    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return function(...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
    
    // 使用防抖进行检查
    const debouncedCheck = debounce(checkImagesInContent, 1000);
    debouncedCheck();
  }, [content]);

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      {/* 侧边栏（大屏常驻，小屏弹出） */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-[#FF6F61] text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="展开侧边栏"
        style={{ display: sidebarOpen ? 'none' : 'block' }}
      >
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full w-56 bg-white/95 border-r border-[#FF6F61] flex flex-col pt-32 pb-6 px-3 gap-4
          shadow-xl rounded-r-2xl transition-transform duration-300 backdrop-blur-sm
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-56 md:flex md:shadow-none md:rounded-none md:bg-white md:backdrop-blur-0
        `}
        style={{ minWidth: '14rem', maxWidth: '14rem' }}
      >
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${false ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/dashboard'); setSidebarOpen(false); }}
        >
          返回管理
        </Button>
      </aside>
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 transition-all duration-300 md:ml-56">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">写文章</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-[#FF6F61] rounded px-3 py-2" placeholder="请输入文章标题" />
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">摘要</label>
              <textarea 
                value={summary} 
                onChange={e => setSummary(e.target.value)} 
                required 
                className="w-full border border-[#FF6F61] rounded px-3 py-2" 
                placeholder="请输入文章摘要（最多200字）" 
                maxLength={200}
                rows={3}
              />
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">分类</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                required 
                className="w-full border border-[#FF6F61] rounded px-3 py-2"
              >
                <option value="八字">八字</option>
                <option value="大六壬">大六壬</option>
                <option value="阴盘奇门">阴盘奇门</option>
                <option value="梅花易数">梅花易数</option>
                <option value="风水">风水</option>
                <option value="面相">面相</option>
                <option value="杂谈">杂谈</option>
                <option value="紫微斗数">紫微斗数</option>
                <option value="姓名">姓名</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">标签（逗号分隔）</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border border-[#FF6F61] rounded px-3 py-2" placeholder="如：八字,命理" />
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">正文</label>
              <div className="flex flex-wrap gap-2 mb-2 items-center">
                <Button type="button" className="bg-[#FF6F61] text-white px-4" onClick={() => insertAround('**')}>B</Button>
                <Button type="button" className="bg-[#FF6F61] text-white px-4 italic" onClick={() => insertAround('*')}>I</Button>
                <Button type="button" className="bg-[#FF6F61] text-white px-4" onClick={() => setShowColorPicker(v => !v)}>A</Button>
                <Button type="button" className="bg-[#FF6F61] text-white" onClick={handleInsertImage}>
                  插入图片
                </Button>
                {showColorPicker && (
                  <div className="absolute z-50">
                    <SketchPicker 
                      color={fontColor} 
                      onChange={(c: ColorResult) => setFontColor(c.hex)} 
                      onChangeComplete={(c: ColorResult) => { insertColor(c.hex); setShowColorPicker(false); }} 
                    />
                  </div>
                )}
              </div>
              <div className="bg-gray-100 p-2 mb-2 rounded text-sm text-gray-600">
                提示: 您可以直接粘贴图片(Ctrl+V)到编辑区域，或使用"插入图片"按钮从本地选择图片
              </div>
              <textarea
                id="article-content"
                ref={contentRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                className="w-full border border-[#FF6F61] rounded px-3 py-2"
                style={{ fontSize: fontSize + 'px', fontFamily, color: fontColor }}
                placeholder="请输入正文内容"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="font-medium text-[#FF6F61]">是否付费文章</label>
              <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-5 h-5 accent-[#FF6F61]" />
            </div>
            <div className="flex items-center gap-4">
              <label className="font-medium text-[#FF6F61]">字号</label>
              <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1">
                {Array.from({length: 15}, (_, i) => 8 + i*2).map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
              <label className="font-medium text-[#FF6F61]">字体</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1">
                <option value="'Microsoft YaHei', '微软雅黑', Arial, sans-serif">微软雅黑</option>
                <option value="SimSun, '宋体', serif">宋体</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">文章图片</label>
              <div className="flex flex-wrap gap-3 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={img} 
                      alt="插图" 
                      className={`w-24 h-24 object-cover rounded border-2 ${cover === img ? 'border-[#FF6F61]' : 'border-gray-200'}`} 
                      onClick={() => setCover(img)} 
                    />
                    {cover === img && <span className="absolute top-1 left-1 bg-[#FF6F61] text-white text-xs px-2 py-0.5 rounded">封面</span>}
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center z-20 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img);
                      }}
                    >
                      ×
                    </button>
                    <div className="absolute opacity-0 group-hover:opacity-100 inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity z-10">
                      <button
                        type="button"
                        className="bg-[#FF6F61] text-white px-2 py-1 rounded text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCover(img);
                        }}
                      >
                        设为封面
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleInsertImage} className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-[#FF6F61] rounded text-[#FF6F61] hover:bg-[#FF6F61]/10">
                  +
                </button>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="text-xs text-gray-500">点击图片可设为封面，鼠标悬停可选择插入到文章中</div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#FF6F61] text-white px-6">提交文章</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}