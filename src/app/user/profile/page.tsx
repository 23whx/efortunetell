'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { Calendar, User, Trash2, Heart, Bookmark } from 'lucide-react';
import TimezoneSelector from '@/components/ui/TimezoneSelector';
import { 
  DEFAULT_TIMEZONE, 
  formatDateWithTimezone, 
  getRelativeTime,
  standardizeDate
} from '@/utils/dateUtils';
import { API_BASE_URL } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';

// 定义预约记录类型
type BookingRecord = {
  _id: string;
  service: string;
  serviceType?: string;
  price: number;
  status: string;
  serviceDate: string;
  timeSlot: string;
  createdAt: string;
  question?: string;
  adminNotes?: string;
  adminFeedback?: {
    content: string;
    createdAt: string;
  };
};

// 定义收藏文章类型
type BookmarkedArticle = {
  _id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  views: number;
  likes: number;
  bookmarks: number;
};

export default function UserProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string, _id: string, email?: string } | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [activeTab, setActiveTab] = useState<'all' | 'bazi' | 'qimen' | 'liuren' | 'naming'>('all');
  const [currentTab, setCurrentTab] = useState<'bookings' | 'bookmarks'>('bookings');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // 获取用户信息和预约
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        router.replace('/user/login');
        return;
      }
    } else {
      router.replace('/user/login');
      return;
    }
  }, [router]);

  // 获取预约数据
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      const token = localStorage.getItem('token');
      if (!token) {
        console.error("获取预约数据失败: 未找到认证Token。");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBookings(data.data);
          }
        } else {
          console.error('获取预约数据失败:', response.status);
        }
      } catch (error) {
        console.error('获取预约数据时出错:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // 获取收藏文章数据
  const fetchBookmarkedArticles = async () => {
    console.log('📚 [收藏功能] 开始获取收藏文章数据');
    console.log('📚 [收藏功能] 用户状态:', user);
    
    if (!user) {
      console.log('📚 [收藏功能] 用户未登录，跳过获取收藏数据');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('📚 [收藏功能] localStorage token:', token ? '有token' : '无token');
    console.log('📚 [收藏功能] localStorage user:', localStorage.getItem('user'));
    
    if (!token) {
      console.error("📚 [收藏功能] 获取收藏数据失败: 未找到认证Token。");
      return;
    }

    setBookmarksLoading(true);
    try {
      const url = `${API_BASE_URL}/api/articles/bookmarks`;
      console.log('📚 [收藏功能] 请求URL:', url);
      console.log('📚 [收藏功能] 请求头:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📚 [收藏功能] 响应状态:', response.status);
      console.log('📚 [收藏功能] 响应状态文本:', response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📚 [收藏功能] 响应数据:', data);
        
        if (data.success && data.data) {
          console.log('📚 [收藏功能] 收藏文章数量:', data.data.length);
          setBookmarkedArticles(data.data);
        } else {
          console.warn('📚 [收藏功能] 响应格式异常:', data);
        }
      } else {
        const errorData = await response.text();
        console.error('📚 [收藏功能] 获取收藏数据失败:', response.status, errorData);
      }
    } catch (error) {
      console.error('📚 [收藏功能] 获取收藏数据时出错:', error);
    } finally {
      setBookmarksLoading(false);
    }
  };

  // 当切换到收藏夹tab时获取收藏数据
  useEffect(() => {
    if (currentTab === 'bookmarks' && user) {
      fetchBookmarkedArticles();
    }
  }, [currentTab, user]);

  // 格式化服务名称
  const formatServiceName = (service: string, serviceType?: string) => {
    const serviceMap: Record<string, string> = {
      'bazi': t('service.bazi'),
      'qimen': t('service.qimen'),
      'liuren': t('service.liuren'),
      'naming': t('service.naming')
    };
    
    if (serviceType && serviceMap[serviceType]) {
      return serviceMap[serviceType];
    }
    return service;
  };

  // 获取服务类型
  const getServiceType = (service: string, serviceType?: string) => {
    if (serviceType) return serviceType;
    
    // 根据服务名称推断类型
    if (service.includes('八字')) return 'bazi';
    if (service.includes('奇门')) return 'qimen';
    if (service.includes('六壬')) return 'liuren';
    if (service.includes('姓名') || service.includes('起名')) return 'naming';
    
    return 'bazi'; // 默认
  };

  // 格式化状态
  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'contact_requested': { text: t('booking.status.contact_requested'), color: 'bg-blue-100 text-blue-800' },
      'pending': { text: t('booking.status.pending'), color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { text: t('booking.status.confirmed'), color: 'bg-green-100 text-green-800' },
      'completed': { text: t('booking.status.completed'), color: 'bg-gray-100 text-gray-800' },
      'cancelled': { text: t('booking.status.cancelled'), color: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 过滤预约记录
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    const bookingType = getServiceType(booking.service, booking.serviceType);
    return bookingType === activeTab;
  });

  // 删除预约记录
  const deleteBooking = async (bookingId: string) => {
    if (!confirm(t('admin.appointments.confirmDelete'))) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('fortune.loginRequired'));
      return;
    }

    setDeletingId(bookingId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 从本地状态中移除已删除的预约
        setBookings(prev => prev.filter(booking => booking._id !== bookingId));
        alert(t('admin.appointments.deleted'));
      } else {
        const errorData = await response.json();
        alert(`${t('admin.appointments.operationFailed')}: ${errorData.message || t('error.unknownError')}`);
      }
    } catch (error) {
      console.error('删除预约记录时出错:', error);
      alert(t('admin.appointments.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FF6F61] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#FF6F61]">{t('user.profile.welcome')}</h1>
              <p className="text-gray-600">{t('common.username')}: {user.username}</p>
              {user.email && <p className="text-gray-600">{t('common.email')}: {user.email}</p>}
            </div>
          </div>
        </div>

        {/* 主要Tab切换 */}
        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6">
          {/* 主要Tab导航 */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-6 py-3 font-medium text-lg flex items-center ${
                currentTab === 'bookings'
                  ? 'border-b-2 border-[#FF6F61] text-[#FF6F61]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentTab('bookings')}
            >
              <Calendar className="mr-2" />
              {t('user.profile.bookingHistory')}
            </button>
            <button
              className={`px-6 py-3 font-medium text-lg flex items-center ${
                currentTab === 'bookmarks'
                  ? 'border-b-2 border-[#FF6F61] text-[#FF6F61]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setCurrentTab('bookmarks')}
            >
              <Bookmark className="mr-2" />
              {t('user.profile.bookmarks')}
            </button>
          </div>

          {/* 预约历史内容 */}
          {currentTab === 'bookings' && (
            <div>
              {/* Tab 切换 */}
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { key: 'all', label: t('common.all') },
                  { key: 'bazi', label: t('service.bazi') },
                  { key: 'qimen', label: t('service.qimen') },
                  { key: 'liuren', label: t('service.liuren') },
                  { key: 'naming', label: t('service.naming') }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-b-2 border-[#FF6F61] text-[#FF6F61]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab(tab.key as any)}
                  >
                    {tab.label}
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {tab.key === 'all' 
                        ? bookings.length 
                        : bookings.filter(b => getServiceType(b.service, b.serviceType) === tab.key).length
                      }
                    </span>
                  </button>
                ))}
              </div>

              {/* 预约列表 */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">{t('common.loading')}</div>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map(booking => {
                    const statusInfo = formatStatus(booking.status);
                    return (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {formatServiceName(booking.service, booking.serviceType)}
                            </h3>
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium mt-1 ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                            <div className="mt-2 text-sm text-gray-600">
                              <div>{t('common.date')}: {formatDate(booking.createdAt)}</div>
                              <div>{t('common.price')}: ${booking.price}</div>
                            </div>
                          </div>
                          
                          {/* 删除按钮 */}
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            disabled={deletingId === booking._id}
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={14} className="mr-1" />
                            {deletingId === booking._id ? t('admin.appointments.deleting') : t('common.delete')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">{t('user.profile.noBookings')}</div>
                  <Button 
                    onClick={() => router.push('/fortune')}
                    className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white"
                  >
                    {t('user.profile.bookNow')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 收藏夹内容 */}
          {currentTab === 'bookmarks' && (
            <div>
              {bookmarksLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">{t('common.loading')}</div>
                </div>
              ) : bookmarkedArticles.length > 0 ? (
                <div className="space-y-4">
                  {bookmarkedArticles.map(article => (
                    <div key={article._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Link href={`/blog/${article._id}`} className="block">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800 hover:text-[#FF6F61] transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                              <span>{article.category}</span>
                              <span>作者: {article.author.username}</span>
                              <span>{formatDate(article.createdAt)}</span>
                              <span className="flex items-center">
                                <Heart size={12} className="mr-1" />
                                {article.likes}
                              </span>
                              <span className="flex items-center">
                                <Bookmark size={12} className="mr-1" />
                                {article.bookmarks}
                              </span>
                            </div>
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-[#FF6F61] text-white text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">{t('user.profile.noBookmarks')}</div>
                  <Button 
                    onClick={() => router.push('/blog')}
                    className="bg-[#FF6F61] hover:bg-[#ff8a75] text-white"
                  >
                    {t('user.profile.goBrowse')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 