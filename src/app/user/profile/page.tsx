'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import Image from 'next/image';
import { Bell, Calendar, Clock, User, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

// 定义历史记录项的类型
type HistoryItem = {
  id: number;
  content: string;
  date: string;
};

// 定义历史记录数据的类型
type HistoryData = {
  '八字': HistoryItem[];
  '大六壬': HistoryItem[];
  '阴盘奇门': HistoryItem[];
  '梅花易数': HistoryItem[];
};

// 历史记录类别类型
type HistoryCategory = keyof HistoryData;

// 模拟历史记录数据
const mockHistoryData: HistoryData = {
  '八字': [
    { id: 1, content: '购买八字排盘详解', date: '2024-06-01' },
    { id: 2, content: '八字流年预测', date: '2024-05-28' },
    { id: 3, content: '八字婚姻分析', date: '2024-05-15' },
    { id: 4, content: '八字财运预测', date: '2024-04-30' },
    { id: 5, content: '八字事业分析', date: '2024-04-22' },
    { id: 6, content: '八字健康预测', date: '2024-04-10' },
    { id: 7, content: '八字五行分析', date: '2024-03-25' },
    { id: 8, content: '八字命理解读', date: '2024-03-18' },
    { id: 9, content: '八字运势预测', date: '2024-03-05' },
    { id: 10, content: '八字性格分析', date: '2024-02-28' },
    { id: 11, content: '八字学业预测', date: '2024-02-15' },
    { id: 12, content: '八字人际关系', date: '2024-02-01' },
  ],
  '大六壬': [
    { id: 1, content: '大六壬占卜预测', date: '2024-06-02' },
    { id: 2, content: '大六壬测事业', date: '2024-05-20' },
    { id: 3, content: '大六壬问姻缘', date: '2024-05-10' },
    { id: 4, content: '大六壬测财运', date: '2024-04-25' },
    { id: 5, content: '大六壬测健康', date: '2024-04-15' },
    { id: 6, content: '大六壬测考试', date: '2024-04-05' },
    { id: 7, content: '大六壬问行人', date: '2024-03-20' },
    { id: 8, content: '大六壬测官司', date: '2024-03-10' },
    { id: 9, content: '大六壬问远方', date: '2024-03-01' },
    { id: 10, content: '大六壬测吉凶', date: '2024-02-20' },
    { id: 11, content: '大六壬问感情', date: '2024-02-10' },
  ],
  '阴盘奇门': [
    { id: 1, content: '阴盘奇门预测', date: '2024-06-03' },
    { id: 2, content: '阴盘奇门测吉日', date: '2024-05-23' },
    { id: 3, content: '阴盘奇门测婚姻', date: '2024-05-13' },
    { id: 4, content: '阴盘奇门问事业', date: '2024-04-28' },
    { id: 5, content: '阴盘奇门测财运', date: '2024-04-18' },
    { id: 6, content: '阴盘奇门问感情', date: '2024-04-08' },
    { id: 7, content: '阴盘奇门测健康', date: '2024-03-28' },
    { id: 8, content: '阴盘奇门问出行', date: '2024-03-18' },
    { id: 9, content: '阴盘奇门测官司', date: '2024-03-08' },
    { id: 10, content: '阴盘奇门问前程', date: '2024-02-25' },
  ],
  '梅花易数': [
    { id: 1, content: '梅花易数断卦', date: '2024-06-04' },
    { id: 2, content: '梅花易数测婚姻', date: '2024-05-25' },
    { id: 3, content: '梅花易数问事业', date: '2024-05-15' },
    { id: 4, content: '梅花易数测财运', date: '2024-05-05' },
    { id: 5, content: '梅花易数问健康', date: '2024-04-20' },
    { id: 6, content: '梅花易数测考试', date: '2024-04-10' },
    { id: 7, content: '梅花易数问前程', date: '2024-03-30' },
    { id: 8, content: '梅花易数测流年', date: '2024-03-15' },
    { id: 9, content: '梅花易数问官非', date: '2024-03-05' },
    { id: 10, content: '梅花易数测吉凶', date: '2024-02-25' },
    { id: 11, content: '梅花易数问感情', date: '2024-02-15' },
    { id: 12, content: '梅花易数测运势', date: '2024-02-05' },
  ]
};

export default function UserProfilePage() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [bookings, setBookings] = useState<Array<{
    id: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    isPast: boolean;
  }>>([]);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryCategory>('八字');
  const [historyPage, setHistoryPage] = useState<Record<HistoryCategory, number>>({
    '八字': 1,
    '大六壬': 1,
    '阴盘奇门': 1,
    '梅花易数': 1
  });
  const router = useRouter();
  
  const ITEMS_PER_PAGE = 10;

  // 获取用户信息
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.replace('/user/login');
    }

    // 模拟从API获取预约信息
    const mockBookings = [
      {
        id: '1',
        serviceName: '八字算命',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 两天后
        appointmentTime: '中国时间19:00-21:00',
        isPast: false
      },
      {
        id: '2',
        serviceName: '八字算命',
        appointmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 两天前
        appointmentTime: '中国时间19:00-21:00',
        isPast: true
      }
    ];
    
    setBookings(mockBookings);
  }, [router]);

  // 计算倒计时
  useEffect(() => {
    if (bookings.length === 0) return;

    const intervalId = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      
      bookings.forEach(booking => {
        if (booking.isPast) {
          newCountdowns[booking.id] = '预约已过期';
          return;
        }
        
        const appointmentDate = new Date(`${booking.appointmentDate}T19:00:00`);
        const now = new Date();
        const diffTime = appointmentDate.getTime() - now.getTime();
        
        if (diffTime <= 0) {
          newCountdowns[booking.id] = '预约时间已到';
          return;
        }
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        newCountdowns[booking.id] = `${diffDays}天 ${diffHours}小时 ${diffMinutes}分钟`;
      });
      
      setCountdowns(newCountdowns);
    }, 60000); // 每分钟更新一次
    
    // 初始更新
    const initialCountdowns: Record<string, string> = {};
    bookings.forEach(booking => {
      if (booking.isPast) {
        initialCountdowns[booking.id] = '预约已过期';
        return;
      }
      
      const appointmentDate = new Date(`${booking.appointmentDate}T19:00:00`);
      const now = new Date();
      const diffTime = appointmentDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        initialCountdowns[booking.id] = '预约时间已到';
        return;
      }
      
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      initialCountdowns[booking.id] = `${diffDays}天 ${diffHours}小时 ${diffMinutes}分钟`;
    });
    setCountdowns(initialCountdowns);

    return () => clearInterval(intervalId);
  }, [bookings]);

  // 联系管理员
  const contactAdmin = () => {
    alert('已发送消息给管理员，请耐心等待回复！');
  };
  
  // 计算当前选中分类的历史记录
  const getCurrentHistoryItems = () => {
    const currentPage = historyPage[activeHistoryTab];
    const allItems = mockHistoryData[activeHistoryTab];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return allItems.slice(startIndex, endIndex);
  };
  
  // 计算总页数
  const getTotalPages = () => {
    const allItems = mockHistoryData[activeHistoryTab];
    return Math.ceil(allItems.length / ITEMS_PER_PAGE);
  };
  
  // 切换页码
  const changePage = (increment: number) => {
    const currentPage = historyPage[activeHistoryTab];
    const totalPages = getTotalPages();
    const newPage = Math.max(1, Math.min(totalPages, currentPage + increment));
    
    setHistoryPage({
      ...historyPage,
      [activeHistoryTab]: newPage
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-6">个人中心</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-[#FF6F61] rounded-full flex items-center justify-center text-white text-2xl">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-gray-600">欢迎回来！</p>
            </div>
          </div>
        </div>
        
        {/* 我的预约卡片 */}
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6">
          <h2 className="text-xl font-bold text-[#FF6F61] mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            我的八字算命预约
          </h2>
          
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border border-[#FF6F61] rounded-lg p-4 bg-[#FFFACD]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs ${booking.isPast || countdowns[booking.id] === '预约时间已到' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                      {booking.isPast || countdowns[booking.id] === '预约时间已到' ? '已到期' : '即将到来'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span>预约日期: {booking.appointmentDate}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <Clock size={16} className="mr-2" />
                    <span>预约时间: {booking.appointmentTime}</span>
                  </div>
                  
                  {/* 倒计时或联系管理员按钮 */}
                  {booking.isPast || countdowns[booking.id] === '预约时间已到' ? (
                    <div className="mt-4">
                      <Button
                        className="bg-[#FF6F61] text-white flex items-center"
                        onClick={contactAdmin}
                      >
                        <Bell className="mr-2" size={16} />
                        联系管理员
                      </Button>
                      
                      <div className="mt-4">
                        <div className="bg-white p-3 rounded-lg mx-auto max-w-[200px] shadow-md">
                          <Image 
                            src="/qrcode.png" 
                            alt="联系二维码" 
                            width={180} 
                            height={180} 
                            className="mx-auto rounded-md"
                          />
                          <p className="text-center text-[#FF6F61] font-medium mt-2">@ROLLKEY</p>
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-2">扫码添加管理员Telegram</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-center font-bold text-[#FF6F61]">
                        <Clock size={16} className="inline mr-2" />
                        倒计时: {countdowns[booking.id] || '计算中...'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">您还没有八字算命预约</p>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button 
              className="bg-[#FF6F61] text-white" 
              onClick={() => router.push('/fortune/bazi')}
            >
              预约八字算命
            </Button>
          </div>
        </div>
        
        {/* 历史记录 */}
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6">
          <h2 className="text-xl font-bold text-[#FF6F61] mb-4 flex items-center">
            <Filter className="mr-2" size={20} />
            历史记录
          </h2>
          
          {/* 分类标签 */}
          <div className="flex flex-wrap border-b border-gray-200 mb-4">
            {(Object.keys(mockHistoryData) as HistoryCategory[]).map(category => (
              <button
                key={category}
                className={`px-4 py-2 font-medium text-sm ${
                  activeHistoryTab === category
                    ? 'border-b-2 border-[#FF6F61] text-[#FF6F61]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveHistoryTab(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* 历史记录列表 */}
          <div className="mb-4">
            {getCurrentHistoryItems().length > 0 ? (
              <ul className="space-y-2">
                {getCurrentHistoryItems().map(item => (
                  <li key={item.id} className="bg-[#FFFACD] border border-[#FF6F61] rounded px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium text-[#FF6F61] mr-2">{activeHistoryTab}</span>
                      <span className="text-gray-700">{item.content}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-6">暂无{activeHistoryTab}历史记录</p>
            )}
          </div>
          
          {/* 分页控制 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              共 {mockHistoryData[activeHistoryTab].length} 条记录
            </span>
            
            <div className="flex items-center">
              <button
                className={`p-1 rounded-full ${
                  historyPage[activeHistoryTab] <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#FF6F61] hover:bg-[#FFFACD]'
                }`}
                onClick={() => changePage(-1)}
                disabled={historyPage[activeHistoryTab] <= 1}
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="mx-2 text-sm">
                {historyPage[activeHistoryTab]} / {getTotalPages() || 1}
              </span>
              
              <button
                className={`p-1 rounded-full ${
                  historyPage[activeHistoryTab] >= getTotalPages() ? 'text-gray-300 cursor-not-allowed' : 'text-[#FF6F61] hover:bg-[#FFFACD]'
                }`}
                onClick={() => changePage(1)}
                disabled={historyPage[activeHistoryTab] >= getTotalPages()}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 