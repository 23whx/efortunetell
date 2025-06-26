'use client';

import { useState, useEffect } from 'react';
import Button from "@/components/ui/button";
import AdminSidebar from '@/components/shared/AdminSidebar';
import { Trash2, RefreshCw, Info, AlertTriangle } from 'lucide-react';

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

export default function CleanImagesPage() {
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [tempImageArticles, setTempImageArticles] = useState<TempImageArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          <h1 className="text-3xl font-bold mb-2 text-[#FF6F61]">图片清理管理</h1>
          <p className="text-gray-700">一键清理文章中的无效图片路径，解决图片显示问题</p>
        </div>

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
        </div>
      </div>
    </div>
  );
} 