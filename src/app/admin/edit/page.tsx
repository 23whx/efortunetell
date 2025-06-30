"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Save, ArrowLeft, Eye, FileText } from 'lucide-react';
import Button from '@/components/ui/button';
import RichTextEditor from '@/components/ui/RichTextEditor';
import CoverImageSelector from '@/components/ui/CoverImageSelector';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { API_BASE_URL, fetchWithAuth, getImageUrl } from "@/config/api";

function AdminEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const isEditMode = Boolean(articleId);
  
  // 基本状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("其他");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverSettings, setCoverSettings] = useState({
    scale: 1,
    positionX: 50,
    positionY: 50
  });

  const [databaseImages, setDatabaseImages] = useState<string[]>([]);
  
  // UI状态
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{ username: string, token: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  
  // 初始化
  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
      return;
    }
    
    if (isEditMode && articleId) {
      fetchArticleDetails(articleId);
    } else {
      // 新建文章时初始化为空
      setDatabaseImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isEditMode, articleId]);

  // 监听内容变化，提取图片URL
  useEffect(() => {
    const extractImagesFromContent = (htmlContent: string) => {
      if (!htmlContent || htmlContent.trim() === '') {
        return [];
      }
      
      console.log('🔍 [extractImagesFromContent] 开始提取图片，内容长度:', htmlContent.length);
      
      const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
      const images: string[] = [];
      let match;
      let matchCount = 0;
      
      while ((match = imgRegex.exec(htmlContent)) !== null) {
        matchCount++;
        const imgSrc = match[1];
        console.log(`🔍 [extractImagesFromContent] 第${matchCount}个图片:`, imgSrc);
        
        if (imgSrc && imgSrc.trim() && !images.includes(imgSrc)) {
          // 转换完整URL为相对路径，便于getImageUrl函数处理
          let normalizedSrc = imgSrc;
          
          // 如果是后端服务器的完整URL，转换为相对路径
          if (imgSrc.includes('://') && imgSrc.includes('/images/')) {
            const urlParts = imgSrc.split('/');
            const imagesIndex = urlParts.findIndex(part => part === 'images');
            if (imagesIndex !== -1) {
              normalizedSrc = '/' + urlParts.slice(imagesIndex).join('/');
              console.log(`🔍 [extractImagesFromContent] 后端URL转换: ${imgSrc} -> ${normalizedSrc}`);
            }
          }
          // 如果是临时图片URL，保持原样
          else if (imgSrc.includes('/temp-images/')) {
            normalizedSrc = imgSrc;
            console.log(`🔍 [extractImagesFromContent] 临时图片保持原样:`, normalizedSrc);
          }
          // 如果已经是相对路径，保持原样
          else if (imgSrc.startsWith('/images/')) {
            normalizedSrc = imgSrc;
            console.log(`🔍 [extractImagesFromContent] 相对路径保持原样:`, normalizedSrc);
          }
          else {
            console.log(`🔍 [extractImagesFromContent] 其他格式:`, imgSrc);
          }
          
          images.push(normalizedSrc);
        } else {
          console.log(`🔍 [extractImagesFromContent] 跳过无效或重复图片:`, imgSrc);
        }
      }
      
      console.log(`🔍 [extractImagesFromContent] 提取完成，找到 ${images.length} 个有效图片:`, images);
      return images;
    };

    const images = extractImagesFromContent(content);
    
    // 添加调试日志
    console.log('📄 [编辑页面] 内容变化，提取到的图片:', images);
  }, [content]);

  // 创建稳定的封面设置变化处理函数
  const handleCoverSettingsChange = useCallback((newSettings: {
    scale: number;
    positionX: number;
    positionY: number;
  }) => {
    console.log('🎨 封面设置变化:', newSettings);
    setCoverSettings(newSettings);
  }, []);

  // 封面选择处理函数 (添加调试日志)
  const handleCoverSelect = useCallback((imageUrl: string | null) => {
    console.log('🖼️ 封面选择变化:');
    console.log('  - 原封面:', coverImage);
    console.log('  - 新封面:', imageUrl);
    
    if (imageUrl) {
      console.log('  - 图片类型:', imageUrl.includes('/temp-images/') ? '临时图片' : '已保存图片');
    }
    
    setCoverImage(imageUrl);
  }, [coverImage]);

  // 图片URL转换辅助函数
  const convertBackendToFrontendUrl = useCallback((htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // 如果是单个图片路径
    if (!htmlContent.includes('<') && htmlContent.startsWith('/images/')) {
      return `https://api.efortunetell.blog${htmlContent}`;
    }
    
    // 处理HTML内容中的图片：将后端相对路径转换为完整URL
    return htmlContent
      .replace(
        /<img([^>]*?)src=["']\/images\/([^"']+)["']([^>]*?)>/g,
        `<img$1src="https://api.efortunetell.blog/images/$2"$3>`
      );
  }, []);

  const convertFullUrlToRelative = useCallback((htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // 将完整的后端URL转换为相对路径（用于保存到数据库）
    return htmlContent
      .replace(/https:\/\/api\.efortunetell\.blog\/images\/([^"'\s]+)/g, '/images/$1');
  }, []);

  const normalizeImagePath = useCallback((path: string): string => {
    // 实现路径规范化逻辑
    return path;
  }, []);

  // 获取文章详情
  const fetchArticleDetails = useCallback(async (id: string) => {
    console.log('📖 ===== 开始加载文章详情 =====');
    console.log('  - 文章ID:', id);
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_BASE_URL}/api/articles/${id}`;
      console.log('  - 请求URL:', url);
      
      const response = await fetchWithAuth(url, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('  - 响应状态:', response.status);
      
      if (!response.ok) {
        console.error('❌ 获取文章失败 - HTTP错误:', response.status);
        throw new Error(`获取文章失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('  - 响应数据:', data);
      
      if (data.success && data.data) {
        const article = data.data;
        console.log('📄 文章原始数据:');
        console.log('  - 标题:', article.title);
        console.log('  - 内容长度:', (article.content || '').length, '字符');
        console.log('  - 分类:', article.category);
        console.log('  - 标签:', article.tags);
        console.log('  - 封面图片:', article.coverImage);
        console.log('  - 封面设置:', article.coverSettings);
        console.log('  - 图片数组:', article.images);
        
        // 转换文章内容中的图片URL为前端可访问的URL
        const convertedContent = convertBackendToFrontendUrl(article.content || '');
              console.log('🔄 内容URL转换完成');
      console.log('📄 转换后的内容预览:');
      console.log(convertedContent.substring(0, 300) + (convertedContent.length > 300 ? '...' : ''));

      console.log('📝 设置表单数据...');
        setTitle(article.title || '');
        setContent(convertedContent);
        setSummary(article.summary || '');
        setCategory(article.category || '其他');
        setTags(Array.isArray(article.tags) ? article.tags.join(',') : '');
        
        // 设置数据库中的图片列表，过滤掉空字符串和无效路径
        const dbImages = Array.isArray(article.images) 
          ? article.images
              .filter((img: string) => img && img.trim() && img !== '') // 过滤空字符串
              .map((img: string) => convertBackendToFrontendUrl(img)) 
          : [];
        setDatabaseImages(dbImages);
        console.log('📸 从数据库加载的图片:', dbImages);
        
        if (article.coverImage) {
          console.log('🎨 处理封面图片...');
          const coverPath = normalizeImagePath(article.coverImage || '');
          console.log('  - 原始封面路径:', coverPath);
          
          // 不再简化路径 - 新格式路径需要保持完整
          // 新格式：/images/articles/{articleId}/filename.jpg - 直接使用
          // 旧格式：/images/filename.jpg - 也直接使用
          setCoverImage(coverPath);
          console.log('  - 设置封面完成 (保持原始路径)');
        } else {
          console.log('🎨 无封面图片');
        }
        
        // 加载封面设置
        if (article.coverSettings) {
          console.log('⚙️ 加载封面设置:', article.coverSettings);
          setCoverSettings(article.coverSettings);
        } else {
          console.log('⚙️ 使用默认封面设置');
          setCoverSettings({ scale: 1, positionX: 50, positionY: 50 });
        }
        
        console.log('✅ 文章数据加载完成');
      } else {
        console.error('❌ 响应数据格式错误:', data);
        throw new Error('获取文章数据失败');
      }
    } catch (err) {
      console.error('💥 ===== 加载文章详情出错 =====');
      console.error('错误详情:', err);
      setError(err instanceof Error ? err.message : '获取文章失败');
    } finally {
      setLoading(false);
      console.log('🏁 文章加载流程结束 (loading = false)');
    }
  }, [convertBackendToFrontendUrl, normalizeImagePath]);

  useEffect(() => {
    if (admin && admin.token && articleId) {
      fetchArticleDetails(articleId);
    }
  }, [admin, articleId, fetchArticleDetails]);

  // 图片上传（暂存到前端临时目录）
  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('🖼️ 开始图片上传流程');
    console.log('  - 文件名:', file.name);
    console.log('  - 文件大小:', file.size, 'bytes');
    console.log('  - 文件类型:', file.type);
    
    const formData = new FormData();
    formData.append('image', file);
    
    console.log('  - 调用前端临时上传API: /api/temp-upload');
    
    // 调用前端API上传到临时目录
    const response = await fetch('/api/temp-upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('  - API响应状态:', response.status);
    
    if (!response.ok) {
      console.error('❌ 图片上传失败 - HTTP错误:', response.status);
      throw new Error('图片上传失败');
    }
    
    const data = await response.json();
    console.log('  - API响应数据:', data);
    
    if (!data.success) {
      console.error('❌ 图片上传失败 - 业务错误:', data.message);
      throw new Error(data.message || '图片上传失败');
    }
    
    // 返回前端临时URL（使用当前窗口的协议、主机和端口）
    const tempImageUrl = `${window.location.origin}${data.data.url}`;
    console.log('✅ 图片暂存成功');
    console.log('  - 临时URL:', tempImageUrl);
    console.log('  - 本地文件路径:', data.data.filePath);
    
    return tempImageUrl;
  };

  // 提交文章
  const handleSubmit = async (status: 'draft' | 'published' = 'published') => {
    console.log('📝 ===== 开始文章提交流程 =====');
    console.log('  - 提交状态:', status);
    console.log('  - 编辑模式:', isEditMode);
    console.log('  - 文章ID:', isEditMode ? searchParams.get('id') : '新建');
    
    if (!title.trim() || !content.trim()) {
      console.error('❌ 验证失败: 标题或内容为空');
      alert('标题和内容不能为空');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      console.log('📊 文章数据准备:');
      console.log('  - 标题:', title.trim());
      console.log('  - 内容长度:', content.trim().length, '字符');
      console.log('  - 摘要长度:', summary.trim().length, '字符');
      console.log('  - 分类:', category);
      console.log('  - 标签:', tags);
      console.log('  - 封面图片:', coverImage);
      console.log('  - 封面设置:', coverSettings);
      
      // 首先创建或更新文章获取文章ID
      let articleId = isEditMode ? searchParams.get('id') : null;
      
      // 从当前内容中提取已有的图片（避免第一阶段误删图片）
      const currentImages: string[] = [];
      if (isEditMode) {
        const imageRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
          const imgSrc = match[1];
          
          // 处理相对路径格式：/images/...
          if (imgSrc.startsWith('/images/')) {
            currentImages.push(imgSrc);
          }
          // 处理完整URL格式：https://api.efortunetell.blog/images/...
          else if (imgSrc.startsWith('https://api.efortunetell.blog/images/')) {
            const relativePath = imgSrc.replace('https://api.efortunetell.blog', '');
            currentImages.push(relativePath);
          }
        }
      }
      
      console.log('📊 第一阶段图片分析:');
      console.log('  - 是否编辑模式:', isEditMode);
      console.log('  - 从内容提取的图片:', currentImages);
      
      // 生成slug（仅在新建文章时需要）
      let articleSlug = '';
      if (!isEditMode) {
        // 为新文章生成唯一的slug
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        articleSlug = `article-${timestamp}-${randomStr}`;
        console.log('  - 生成新文章slug:', articleSlug);
      }
      
      const articleData = {
        title: title.trim(),
        content: content.trim(), // 先用原始内容
        summary: summary.trim(),
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status,
        coverImage: coverImage || null,
        coverSettings: coverImage ? coverSettings : null,
        images: isEditMode ? currentImages : [], // 编辑模式保持现有图片，新建模式为空
        ...(articleSlug && { slug: articleSlug }) // 仅在新建文章时添加slug
      };

      console.log('🚀 第一阶段: 提交基础文章数据...');
              console.log('  - API URL:', isEditMode ? `${API_BASE_URL}/api/articles/${articleId}` : `${API_BASE_URL}/api/articles`);
      console.log('  - HTTP方法:', isEditMode ? 'PUT' : 'POST');

              const url = isEditMode ? `${API_BASE_URL}/api/articles/${articleId}` : `${API_BASE_URL}/api/articles`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      console.log('  - 基础数据提交响应状态:', response.status);
      
      const result = await response.json();
      console.log('  - 基础数据提交响应:', result);

      if (!result.success) {
        console.error('❌ 基础数据提交失败:', result.message);
        throw new Error(result.message || '保存失败');
      }
      
      // 获取文章ID（新建时从响应中获取）
      if (!articleId && result.data?._id) {
        articleId = result.data._id;
        console.log('  - 新建文章获得ID:', articleId);
      }
      
      if (!articleId) {
        console.error('❌ 无法获取文章ID');
        throw new Error('无法获取文章ID');
      }
      
      console.log('✅ 第一阶段完成 - 文章基础信息保存成功');
      console.log('  - 文章ID:', articleId);
      
      // 处理临时图片：移动到后端并更新内容
      console.log('🖼️ 第二阶段: 处理文章内容中的临时图片...');
      const updatedContent = await processTemporaryImages(content, articleId);
      
      // 处理封面图片中的临时URL
      console.log('🎨 第三阶段: 处理封面图片...');
      let updatedCoverImage = coverImage;
      if (coverImage && coverImage.includes('/temp-images/')) {
        const coverFileName = coverImage.split('/').pop();
        console.log('  - 检测到封面临时图片:', coverFileName);
        
        if (coverFileName) {
          console.log('  - 开始移动封面图片...');
          
          try {
            // 从前端临时API获取图片内容
            const tempImageUrl = `/temp-images/${coverFileName}`;
            const imageResponse = await fetch(tempImageUrl);
            
            if (!imageResponse.ok) {
              console.error('  - 无法获取临时封面图片:', coverFileName);
              throw new Error(`无法获取临时图片: ${coverFileName}`);
            }
            
            const imageBlob = await imageResponse.blob();
            console.log('  - 获取封面图片成功, 大小:', imageBlob.size, 'bytes');
            
            // 创建File对象
            const imageFile = new File([imageBlob], coverFileName, { type: imageBlob.type });
            
            // 上传到后端文章专用目录
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const uploadResponse = await fetchWithAuth(`${API_BASE_URL}/api/upload/article-image/${articleId}`, {
            method: 'POST',
              body: formData
            });
            
            if (!uploadResponse.ok) {
              console.error('  - 上传封面图片到后端失败');
              throw new Error('上传封面图片失败');
            }
            
            const uploadResult = await uploadResponse.json();
            if (uploadResult.success && uploadResult.data.url) {
              // 保存相对路径到数据库（不包含域名）
              updatedCoverImage = uploadResult.data.url;
              if (uploadResult.data.isDuplicate) {
                console.log('✅ 封面图片复用现有文件 (节省存储空间)');
              } else {
                console.log('✅ 封面图片上传成功');
              }
            console.log('  - 原路径:', coverImage);
            console.log('  - 新路径:', updatedCoverImage);
          } else {
              console.error('  - 上传响应异常:', uploadResult);
              throw new Error('上传响应异常');
            }
                     } catch (error) {
             console.error('❌ 封面图片移动失败:', error instanceof Error ? error.message : error);
             // 即使移动失败，也要继续流程，不中断文章提交
          }
        }
      } else {
        console.log('  - 无需处理封面图片 (不是临时图片)');
      }
      
      // 如果内容或封面有变化，再次更新文章
      const contentChanged = updatedContent !== content;
      const coverChanged = updatedCoverImage !== coverImage;
      
      console.log('🔄 检查是否需要最终更新:');
      console.log('  - 内容是否改变:', contentChanged);
      console.log('  - 封面是否改变:', coverChanged);
      
      if (contentChanged || coverChanged) {
        console.log('🚀 第四阶段: 最终更新文章...');
        
        // 从更新后的内容中提取图片路径
        const imageRegex = /<img[^>]+src="([^">]+)"/g;
        const images: string[] = [];
        let match;
        while ((match = imageRegex.exec(updatedContent)) !== null) {
          const imgSrc = match[1];
          
          // 处理相对路径格式：/images/...
          if (imgSrc.startsWith('/images/')) {
            images.push(imgSrc);
          }
          // 处理完整URL格式：https://api.efortunetell.blog/images/...
          else if (imgSrc.startsWith('https://api.efortunetell.blog/images/')) {
            const relativePath = imgSrc.replace('https://api.efortunetell.blog', '');
            images.push(relativePath);
          }
        }
        
        console.log('  - 从内容中提取的图片路径:', images);
        
        // 将更新后的内容转换为数据库存储格式（相对路径）
        const contentForDatabase = convertFullUrlToRelative(updatedContent);
        
        const finalUpdateData = {
          ...articleData,
          content: contentForDatabase,
          coverImage: updatedCoverImage,
          images: images
        };
        
        console.log('  - 最终更新数据:', {
          ...finalUpdateData,
          content: `${finalUpdateData.content.substring(0, 100)}...` // 只显示前100字符
        });
        
        const finalUpdateResponse = await fetchWithAuth(`${API_BASE_URL}/api/articles/${articleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalUpdateData)
        });
        
        console.log('  - 最终更新响应状态:', finalUpdateResponse.status);
        
        const finalResult = await finalUpdateResponse.json();
        console.log('  - 最终更新响应:', finalResult);
        
        if (!finalResult.success) {
          console.error('❌ 最终更新失败:', finalResult.message);
          throw new Error(finalResult.message || '更新图片失败');
        }
        
        console.log('✅ 第四阶段完成 - 文章最终更新成功');
      }

      // 最后清理临时图片目录（只删除已处理的图片）
      console.log('🧹 最后阶段: 清理已处理的临时图片...');
      try {
        // 收集所有已经处理的临时图片文件名
        const processedTempFiles: string[] = [];
        
        // 从原始内容中提取临时图片文件名
        const tempImageRegex = /\/temp-images\/([^"'\s]+)/g;
        let tempMatch;
        while ((tempMatch = tempImageRegex.exec(content)) !== null) {
          const fileName = tempMatch[1];
          if (!processedTempFiles.includes(fileName)) {
            processedTempFiles.push(fileName);
          }
        }
        
        // 从封面图片中提取临时文件名
        if (coverImage && coverImage.includes('/temp-images/')) {
          const coverFileName = coverImage.split('/').pop();
          if (coverFileName && !processedTempFiles.includes(coverFileName)) {
            processedTempFiles.push(coverFileName);
          }
        }
        
        console.log('  - 已处理的临时图片文件:', processedTempFiles);
        
        if (processedTempFiles.length > 0) {
          const cleanupResponse = await fetch('/api/temp-cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filesToDelete: processedTempFiles })
          });
          
          const cleanupResult = await cleanupResponse.json();
          if (cleanupResult.success) {
            console.log('✅ 临时图片清理成功:', cleanupResult.message);
          } else {
            console.warn('⚠️ 临时图片清理失败:', cleanupResult.message);
          }
        } else {
          console.log('  - 没有临时图片需要清理');
        }
      } catch (cleanupError) {
        console.warn('⚠️ 临时图片清理出错:', cleanupError);
        // 清理失败不影响主流程，只记录警告
      }

      console.log('🎉 ===== 文章提交流程完成 =====');
      alert(isEditMode ? '文章更新成功！' : '文章创建成功！');
      router.push('/admin/articles');
    } catch (err) {
      console.error('💥 ===== 文章提交流程出错 =====');
      console.error('错误详情:', err);
      console.error('错误堆栈:', (err as Error).stack);
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSubmitting(false);
      console.log('🏁 文章提交流程结束 (submitting = false)');
    }
  };
  
  // 处理临时图片：读取前端临时图片并上传到后端
  const processTemporaryImages = async (htmlContent: string, articleId: string): Promise<string> => {
    console.log('🔄 processTemporaryImages 开始');
    console.log('  - 文章ID:', articleId);
    console.log('  - 内容长度:', htmlContent.length, '字符');
    
    // 更灵活的临时图片正则表达式，匹配任何端口的temp-images URL
    const tempImageRegex = /https?:\/\/[^\/]+\/temp-images\/([^"'\s]+)/g;
    const tempImages: string[] = [];
    const tempUrls: string[] = [];
    let match;
    
    // 提取所有临时图片URL和文件名
    console.log('  - 开始提取临时图片URL...');
    let matchCount = 0;
    while ((match = tempImageRegex.exec(htmlContent)) !== null) {
      matchCount++;
      const fileName = match[1];
      const fullUrl = match[0];
      tempImages.push(fileName);
      tempUrls.push(fullUrl);
      console.log(`    ${matchCount}. 找到临时图片:`, fileName);
      console.log(`    完整URL:`, fullUrl);
    }
    
    if (tempImages.length === 0) {
      console.log('  - 没有临时图片需要处理');
      return htmlContent;
    }
    
    console.log(`✅ 总共找到 ${tempImages.length} 个临时图片:`, tempImages);
    
    // 读取每个临时图片并上传到后端
    console.log('  - 开始从前端读取临时图片并上传到后端...');
    const uploadResults: { [filename: string]: string } = {};
    
    for (let i = 0; i < tempImages.length; i++) {
      const fileName = tempImages[i];
      try {
        console.log(`  - 处理图片 ${i + 1}/${tempImages.length}: ${fileName}`);
        
        // 从前端临时API获取图片内容
        const tempImageUrl = `/temp-images/${fileName}`;
        const imageResponse = await fetch(tempImageUrl);
        
        if (!imageResponse.ok) {
          console.error(`    ❌ 无法获取临时图片: ${fileName}`);
          continue;
        }
        
        const imageBlob = await imageResponse.blob();
        console.log(`    ✅ 获取图片成功, 大小: ${imageBlob.size} bytes`);
        
        // 创建File对象
        const imageFile = new File([imageBlob], fileName, { type: imageBlob.type });
        
        // 上传到后端文章专用目录
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadResponse = await fetchWithAuth(`${API_BASE_URL}/api/upload/article-image/${articleId}`, {
      method: 'POST',
          body: formData
        });
        
        if (!uploadResponse.ok) {
          console.error(`    ❌ 上传图片到后端失败: ${fileName}`);
          continue;
        }
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success && uploadResult.data.url) {
          // 记录新的图片路径
          uploadResults[fileName] = uploadResult.data.url;
          if (uploadResult.data.isDuplicate) {
            console.log(`    ✅ 发现重复文件，复用现有: ${fileName} -> ${uploadResult.data.url} (节省存储空间)`);
          } else {
            console.log(`    ✅ 上传新文件: ${fileName} -> ${uploadResult.data.url}`);
          }
        } else {
          console.error(`    ❌ 上传响应异常: ${fileName}`, uploadResult);
        }
        
      } catch (error) {
        console.error(`    ❌ 处理图片失败: ${fileName}`, error);
      }
    }
    
    console.log('✅ 所有图片上传完成，开始更新内容中的URL...');
    console.log('  - 图片映射表:', uploadResults);
    
    // 更新内容中的图片URL
    let updatedContent = htmlContent;
    let updateCount = 0;
    
    for (const [fileName, newPath] of Object.entries(uploadResults)) {
      // 数据库中保存相对路径，显示时再转换为完整URL
      const relativePath = newPath; // newPath 已经是相对路径：/images/articles/{id}/filename.png
      
      console.log(`  - 替换URL ${updateCount + 1} (文件: ${fileName}):`);
      console.log(`    新相对路径: ${relativePath}`);
      
      // 使用更灵活的正则表达式，匹配任何包含该文件名的temp-images URL
      const tempUrlRegex = new RegExp(`https?://[^/]+/temp-images/${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      
      // 查找所有匹配的URL
      const matches = updatedContent.match(tempUrlRegex);
      if (matches) {
        console.log(`    找到 ${matches.length} 个匹配的URL:`);
        matches.forEach((url, i) => console.log(`      ${i + 1}. ${url}`));
      } else {
        console.log(`    ⚠️ 未找到包含文件名 ${fileName} 的临时URL`);
      }
      
      const beforeLength = updatedContent.length;
      // 替换为相对路径，数据库中保存相对路径
      updatedContent = updatedContent.replace(tempUrlRegex, relativePath);
      const afterLength = updatedContent.length;
      
      if (beforeLength !== afterLength) {
        updateCount++;
        console.log(`    ✅ 替换成功 (长度变化: ${beforeLength} -> ${afterLength})`);
      } else {
        console.log(`    ⚠️ 未找到匹配的URL进行替换`);
      }
    }
    
    console.log(`✅ URL更新完成，共更新了 ${updateCount} 个图片URL`);
    console.log('🏁 processTemporaryImages 结束');
    return updatedContent;
  };

  if (!admin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFACD] flex">
        <AdminSidebar activeItem="articles" />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="articles" />
      
      <main className="flex-1 flex flex-col transition-all duration-300 md:ml-56">
        {/* 头部工具栏 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/articles')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                返回文章列表
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditMode ? '编辑文章' : '写新文章'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 标签页切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'write'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText size={16} className="inline mr-2" />
                  编辑
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye size={16} className="inline mr-2" />
                  预览
                </button>
              </div>
              
              {/* 保存按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmit('draft')}
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                >
                  保存草稿
                </Button>
                <Button
                  onClick={() => handleSubmit('published')}
                  size="sm"
                  disabled={submitting}
                  className="bg-[#FF6F61] hover:bg-[#FF5A4D] text-white flex items-center"
                >
                  <Save size={16} className="mr-2" />
                  {submitting ? '保存中...' : '发布文章'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 主要内容区域 */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === 'write' ? (
              <>
                {/* 文章信息表单 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">文章信息</h3>
                  
                  {/* 标题输入 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="请输入文章标题..."
                      className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
                      >
                        <option value="易经">易经</option>
                        <option value="塔罗">塔罗</option>
                        <option value="占星">占星</option>
                        <option value="风水">风水</option>
                        <option value="八字">八字</option>
                        <option value="命理">紫微斗数</option>
                        <option value="大六壬">大六壬</option>
                        <option value="梅花易数">梅花易数</option>
                        <option value="阴盘奇门">阴盘奇门</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="用逗号分隔多个标签"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="简要描述文章内容..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* 富文本编辑器 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    onImageUpload={handleImageUpload}
                    onSetCover={handleCoverSelect}
                    placeholder="开始写作..."
                  />
                </div>

                {/* 封面图片选择 */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <CoverImageSelector
                    selectedCover={coverImage}
                    coverSettings={coverSettings}
                    onCoverSettingsChange={handleCoverSettingsChange}
                    contentImages={databaseImages}
                    onCoverSelect={handleCoverSelect}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </>
            ) : (
              /* 预览模式 */
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="prose prose-lg max-w-none">
                  {coverImage && (
                    <Image
                      src={getImageUrl(coverImage)}
                      alt="封面图片"
                      width={800}
                      height={256}
                      className="w-full h-64 object-cover rounded-lg mb-8"
                      unoptimized={true}
                    />
                  )}
                  
                  <h1 className="text-3xl font-bold mb-4">{title || '无标题'}</h1>
                  
                  {summary && (
                    <div className="text-gray-600 italic mb-6 p-4 bg-gray-50 rounded-lg">
                      {summary}
                    </div>
                  )}
                  
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: content || '<p className="text-gray-400">开始写作...</p>' 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFACD] flex">
        <AdminSidebar activeItem="articles" />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    }>
      <AdminEditContent />
    </Suspense>
  );
} 