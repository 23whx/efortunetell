'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { fetchWithAuth, API_BASE_URL } from '@/config/api';

interface ImageStats {
  totalFiles: number;
  totalSize: number;
  duplicateGroups: number;
  duplicateFiles: number;
  wastedSpace: number;
  unreferencedFiles: number;
}

interface DuplicateGroup {
  hash: string;
  files: Array<{
    name: string;
    relativePath: string;
    size: number;
    mtime: string;
  }>;
  size: number;
  count: number;
}

export default function ImageManagement() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ username: string; token: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // 初始化检查登录状态
  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  // 获取图片统计信息
  const fetchImageStats = async () => {
    if (!admin?.token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/images/stats`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`获取统计失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setDuplicates(data.data.duplicates || []);
      } else {
        throw new Error(data.message || '获取统计失败');
      }
    } catch (err) {
      console.error('获取图片统计错误:', err);
      setError(err instanceof Error ? err.message : '获取统计失败');
    } finally {
      setLoading(false);
    }
  };

  // 清理重复文件
  const cleanupDuplicates = async () => {
    if (!admin?.token) return;
    
    if (!confirm('确定要清理重复文件吗？此操作不可撤销，将保留每组重复文件中最新的一个。')) {
      return;
    }
    
    try {
      setCleanupLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/images/cleanup-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`清理失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert(`清理完成！删除了 ${data.data.deletedCount} 个重复文件，节省空间 ${data.data.savedSpaceMB} MB`);
        // 重新获取统计信息
        fetchImageStats();
      } else {
        throw new Error(data.message || '清理失败');
      }
    } catch (err) {
      console.error('清理重复文件错误:', err);
      setError(err instanceof Error ? err.message : '清理失败');
    } finally {
      setCleanupLoading(false);
    }
  };

  // 清理未引用文件
  const cleanupUnreferenced = async () => {
    if (!admin?.token) return;
    
    if (!confirm('确定要清理未引用的文件吗？此操作不可撤销，将删除所有未被文章引用的图片。')) {
      return;
    }
    
    try {
      setCleanupLoading(true);
      setError(null);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/images/cleanup-unreferenced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`清理失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert(`清理完成！删除了 ${data.data.deletedCount} 个未引用文件，节省空间 ${data.data.savedSpaceMB} MB`);
        // 重新获取统计信息
        fetchImageStats();
      } else {
        throw new Error(data.message || '清理失败');
      }
    } catch (err) {
      console.error('清理未引用文件错误:', err);
      setError(err instanceof Error ? err.message : '清理失败');
    } finally {
      setCleanupLoading(false);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="images" />
      
      <main className="flex-1 flex flex-col transition-all duration-300 md:ml-56">
        {/* 头部 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">图片管理</h1>
            <div className="flex gap-3">
              <Button
                onClick={fetchImageStats}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? '分析中...' : '重新分析'}
              </Button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 主要内容 */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* 统计信息卡片 */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">总文件数</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">总大小</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatSize(stats.totalSize)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">重复文件组</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.duplicateGroups}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">重复文件数</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.duplicateFiles}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">浪费空间</h3>
                  <p className="text-2xl font-bold text-red-600">{formatSize(stats.wastedSpace)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">未引用文件</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.unreferencedFiles}</p>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {stats && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">清理操作</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={cleanupDuplicates}
                    disabled={cleanupLoading || stats.duplicateFiles === 0}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {cleanupLoading ? '清理中...' : `清理重复文件 (${stats.duplicateFiles}个)`}
                  </Button>
                  <Button
                    onClick={cleanupUnreferenced}
                    disabled={cleanupLoading || stats.unreferencedFiles === 0}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {cleanupLoading ? '清理中...' : `清理未引用文件 (${stats.unreferencedFiles}个)`}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>注意：</strong>清理操作不可撤销。重复文件将保留最新的一个，未引用文件将被完全删除。
                </p>
              </div>
            )}

            {/* 重复文件列表 */}
            {duplicates.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">重复文件预览 (前20组)</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {duplicates.map((group, index) => (
                      <div key={group.hash} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            重复组 #{index + 1} ({group.count} 个文件, {formatSize(group.size)} 每个)
                          </h4>
                          <span className="text-sm text-gray-500">
                            哈希: {group.hash.substring(0, 12)}...
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {file.relativePath}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDate(file.mtime)}
                                </p>
                              </div>
                              {fileIndex === 0 && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  保留
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 初始状态 */}
            {!loading && !stats && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">图片统计分析</h3>
                <p className="text-gray-500 mb-6">点击&quot;重新分析&quot;按钮开始分析图片文件，查找重复和未引用的文件。</p>
                <Button onClick={fetchImageStats} className="bg-[#FF6F61] hover:bg-[#FF5A4D] text-white">
                  开始分析
                </Button>
              </div>
            )}

            {/* 加载状态 */}
            {loading && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">正在分析图片文件...</p>
              </div>
            )}

            <p className="text-gray-600 text-sm">
              点击图片可复制路径。支持的格式：JPG、PNG、GIF、WebP。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 