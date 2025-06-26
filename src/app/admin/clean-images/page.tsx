'use client';

import { useState, useEffect } from 'react';
import Button from "@/components/ui/button";
import AdminSidebar from '@/components/shared/AdminSidebar';
import { Trash2, RefreshCw, Info, AlertTriangle, Search, ChevronLeft, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';

interface ImageStats {
  totalArticles: number;
  articlesWithCover: number;
  articlesWithTempImages: number;
  articlesWithBrokenImages: number;
}

interface TempImageArticle {
  _id: string;
  title: string;
  coverImage: string;
  createdAt: string;
}

interface CleanResult {
  cleaned: number;
  message: string;
}

interface ArticleWithImages {
  _id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: string;
  coverImage: string | null;
  contentImages: string[];
  hasImages: boolean;
  imageCount: number;
}

interface ImagePathsData {
  title: string;
  articles: ArticleWithImages[];
  pagination: {
    current: number;
    total: number;
    totalArticles: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalFound: number;
    currentPage: number;
    articlesWithImages: number;
    totalImages: number;
  };
}

export default function CleanImagesPage() {
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [tempImageArticles, setTempImageArticles] = useState<TempImageArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 图片路径检查相关状态
  const [activeTab, setActiveTab] = useState<'clean' | 'check'>('clean');
  const [imagePathsData, setImagePathsData] = useState<ImagePathsData | null>(null);
  const [checkType, setCheckType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkLoading, setCheckLoading] = useState(false);

  // 获取图片统计信息
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/image-stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('获取统计信息失败');
      }

      const data = await response.json();
      setStats(data.stats);
      setTempImageArticles(data.tempImageArticles || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取统计信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 清理图片
  const cleanImages = async (type: string) => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const response = await fetch('/api/admin/clean-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error('清理失败');
      }

      const data = await response.json();
      setResult(data.result);
      setStats(data.stats);
      
      // 重新获取统计信息
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : '清理失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查图片路径
  const checkImagePaths = async (type: string = checkType, page: number = currentPage) => {
    try {
      setCheckLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/check-image-paths?type=${type}&page=${page}&limit=20`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('检查图片路径失败');
      }

      const data = await response.json();
      setImagePathsData(data);
      setCheckType(type);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查图片路径失败');
    } finally {
      setCheckLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cleanOptions = [
    {
      type: 'temp-images',
      title: '清理临时图片',
      description: '清理包含 temp-images 路径的图片（推荐）',
      color: 'bg-blue-500',
      icon: <Trash2 className="h-4 w-4" />
    },
    {
      type: 'broken-images',
      title: '清理无效图片',
      description: '清理 localhost、127.0.0.1、http协议等无效图片路径',
      color: 'bg-orange-500',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      type: 'all-cover-images',
      title: '清理所有封面',
      description: '清理所有文章的封面图片（慎用！）',
      color: 'bg-red-500',
      icon: <Trash2 className="h-4 w-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="clean-images" />
      <div className="flex-1 md:ml-56 p-6">
        <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#FF6F61]">图片管理中心</h1>
          <p className="text-gray-700">检查和清理文章中的图片路径，解决图片显示问题</p>
          
          {/* 标签页切换 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('clean')}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                activeTab === 'clean' 
                  ? 'bg-[#FF6F61] text-white border-[#FF6F61]' 
                  : 'bg-white text-[#FF6F61] border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white'
              }`}
            >
              🧹 图片清理
            </button>
            <button
              onClick={() => {
                setActiveTab('check');
                if (!imagePathsData) checkImagePaths();
              }}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                activeTab === 'check' 
                  ? 'bg-[#FF6F61] text-white border-[#FF6F61]' 
                  : 'bg-white text-[#FF6F61] border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white'
              }`}
            >
              🔍 路径检查
            </button>
          </div>
        </div>

        {/* 清理功能 */}
        {activeTab === 'clean' && (
          <>
            {/* 统计信息卡片 */}
            <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-[#FF6F61]" />
            <h2 className="text-xl font-bold text-[#FF6F61]">图片统计信息</h2>
          </div>
          <p className="text-gray-600 mb-4">当前数据库中的图片使用情况</p>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={fetchStats} 
              disabled={loading}
              variant="outline"
              className="border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新统计
            </Button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <div className="text-sm text-gray-600">总文章数</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.articlesWithCover}</div>
                <div className="text-sm text-gray-600">有封面图片</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.articlesWithTempImages}</div>
                <div className="text-sm text-gray-600">临时图片路径</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.articlesWithBrokenImages}</div>
                <div className="text-sm text-gray-600">无效图片路径</div>
              </div>
            </div>
          )}
        </div>

        {/* 包含临时图片的文章列表 */}
        {tempImageArticles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-yellow-400 p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-600 mb-2">包含临时图片的文章</h2>
            <p className="text-gray-600 mb-4">以下文章包含临时图片路径，需要清理</p>
            
            <div className="space-y-2">
              {tempImageArticles.map((article) => (
                <div key={article._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{article.title}</div>
                    <div className="text-sm text-gray-500">{article.coverImage}</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
                    临时图片
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 清理操作按钮 */}
        <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 mb-6">
          <h2 className="text-xl font-bold text-[#FF6F61] mb-2">清理操作</h2>
          <p className="text-gray-600 mb-4">选择合适的清理方式，建议先使用"清理临时图片"</p>
          
          <div className="space-y-4">
            {cleanOptions.map((option) => (
              <div key={option.type} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {option.icon}
                    <h3 className="font-medium">{option.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <Button
                  onClick={() => cleanImages(option.type)}
                  disabled={loading}
                  className={`${option.color} text-white hover:opacity-90`}
                >
                  {loading ? '清理中...' : '执行清理'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-green-50 border border-green-400 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-green-600" />
              <strong className="text-green-800">清理完成：</strong>
              <span className="text-green-700">{result.message}</span>
            </div>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-400 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <strong className="text-red-800">错误：</strong>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

            {/* 使用说明 */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">使用说明</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>清理临时图片：</strong>推荐日常使用，清理编辑过程中产生的临时图片路径</p>
                <p>• <strong>清理无效图片：</strong>清理各种无效的图片路径，包括本地地址、错误协议等</p>
                <p>• <strong>清理所有封面：</strong>删除所有文章的封面图片，请谨慎使用</p>
                <p>• 清理操作不可撤销，建议在操作前备份重要数据</p>
                <p>• 清理后文章将显示默认封面或无封面状态</p>
              </div>
            </div>
          </>
        )}

        {/* 路径检查功能 */}
        {activeTab === 'check' && (
          <>
            {/* 筛选器 */}
            <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-[#FF6F61]" />
                <h2 className="text-xl font-bold text-[#FF6F61]">图片路径检查</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { value: 'all', label: '所有文章', icon: '📄' },
                  { value: 'cover-only', label: '仅封面图片', icon: '🖼️' },
                  { value: 'content-only', label: '仅内容图片', icon: '📝' },
                  { value: 'both', label: '封面+内容', icon: '🎨' },
                  { value: 'temp-images', label: '临时图片', icon: '⚠️' },
                  { value: 'broken', label: '无效路径', icon: '❌' },
                  { value: 'no-images', label: '无图片', icon: '📄' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => checkImagePaths(option.value, 1)}
                    disabled={checkLoading}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      checkType === option.value
                        ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                        : 'bg-white text-[#FF6F61] border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => checkImagePaths(checkType, currentPage)} 
                disabled={checkLoading}
                className="px-4 py-2 bg-[#FF6F61] text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checkLoading ? 'animate-spin' : ''}`} />
                {checkLoading ? '检查中...' : '刷新检查'}
              </button>
            </div>

            {/* 检查结果 */}
            {imagePathsData && (
              <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#FF6F61]">{imagePathsData.title}</h3>
                  <div className="text-sm text-gray-600">
                    找到 {imagePathsData.summary.totalFound} 篇文章，共 {imagePathsData.summary.totalImages} 张图片
                  </div>
                </div>

                {/* 分页信息 */}
                {imagePathsData.pagination.total > 1 && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">
                      第 {imagePathsData.pagination.current} 页，共 {imagePathsData.pagination.total} 页
                    </div>
                                         <div className="flex gap-2">
                      <button
                        onClick={() => checkImagePaths(checkType, currentPage - 1)}
                        disabled={!imagePathsData.pagination.hasPrev || checkLoading}
                        className="px-3 py-1 text-sm bg-white text-[#FF6F61] border border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => checkImagePaths(checkType, currentPage + 1)}
                        disabled={!imagePathsData.pagination.hasNext || checkLoading}
                        className="px-3 py-1 text-sm bg-white text-[#FF6F61] border border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 文章列表 */}
                <div className="space-y-3">
                  {imagePathsData.articles.map((article) => (
                    <div key={article._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{article.title}</h4>
                          <div className="text-sm text-gray-500 mt-1">
                            {article.category} • {new Date(article.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span>{article.imageCount} 张图片</span>
                        </div>
                      </div>

                      {/* 封面图片 */}
                      {article.coverImage && (
                        <div className="mb-2">
                          <div className="text-xs text-blue-600 font-medium mb-1">封面图片:</div>
                          <div className="text-xs bg-blue-50 p-2 rounded font-mono break-all">
                            {article.coverImage}
                          </div>
                        </div>
                      )}

                      {/* 内容图片 */}
                      {article.contentImages.length > 0 && (
                        <div>
                          <div className="text-xs text-green-600 font-medium mb-1">
                            内容图片 ({article.contentImages.length}):
                          </div>
                          <div className="space-y-1">
                            {article.contentImages.map((img, index) => (
                              <div key={index} className="text-xs bg-green-50 p-2 rounded font-mono break-all">
                                {img}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!article.hasImages && (
                        <div className="text-xs text-gray-500 italic">此文章没有图片</div>
                      )}
                    </div>
                  ))}
                </div>

                {imagePathsData.articles.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    没有找到符合条件的文章
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
} 