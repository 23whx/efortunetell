import { notFound } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/api';
import { ArrowLeft } from 'lucide-react';
import BlogDetails from '@/components/blog/BlogDetails';
import { Metadata } from 'next';

interface BlogDetailPageProps {
  params: Promise<{ id: string }>
}

// 文章接口定义
export interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: CommentType[];
  commentsCount: number;
  coverImage: string;
  coverSettings?: {
    scale: number;
    positionX: number;
    positionY: number;
  };
  isPaid: boolean;
}

export type CommentType = {
  _id: string;
  user?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  username?: string; // 后端有时直接返回username字段
  content: string;
  date?: string;
  createdAt?: string; // 后端返回的创建时间字段
  replies?: CommentType[];
};

// 生成页面元数据
export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
    if (!response.ok) {
      return {
        title: '博客文章',
        description: '查看我们的博客文章'
      };
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      const article = data.data;
      return {
        title: article.title,
        description: article.summary || `阅读关于 ${article.title} 的文章`,
        openGraph: {
          title: article.title,
          description: article.summary,
          images: article.coverImage ? [article.coverImage] : [],
        },
      };
    }
    
    return {
      title: '博客文章',
      description: '查看我们的博客文章'
    };
      } catch {
    return {
      title: '博客文章',
      description: '查看我们的博客文章'
    };
  }
}

// 服务器组件，用于获取数据
export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  
  if (!id) return notFound();

  // 在服务器组件中获取文章数据
  let article: Article | null = null;
  let error: string | null = null;
  
  try {
    console.log('🔍 [页面组件] 开始获取文章数据, ID:', id);
    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log('🔍 [页面组件] API响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`获取文章失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 [页面组件] API返回数据:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      article = data.data;
      console.log('🔍 [页面组件] 文章数据设置成功:', {
        title: article?.title || '',
        contentLength: article?.content?.length || 0,
        coverImage: article?.coverImage || '',
        contentPreview: article?.content?.substring(0, 100) || ''
      });
    } else {
      throw new Error('获取文章数据格式错误');
    }
  } catch (err) {
    console.error('获取文章详情错误:', err);
    error = err instanceof Error ? err.message : '获取文章详情失败，请稍后重试';
  }
  
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/blog" 
          className="inline-flex items-center hover:text-[#ff8a75] mb-6 px-6 pt-6 transition-colors"
          style={{ color: '#ff6f61' }}
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">返回博客列表</span>
        </Link>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mx-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">加载文章失败</h3>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : !article ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">正在加载文章...</p>
            </div>
          </div>
        ) : (
          // 将文章数据传递给客户端组件
          <BlogDetails article={article} />
        )}
      </div>
    </div>
  );
} 