'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Calendar, Mail, CreditCard, Check, Send, X, RefreshCw, Globe } from 'lucide-react';

import { getAuthHeaders, fetchWithAuth } from '@/config/api';
import TimezoneSelector from '@/components/ui/TimezoneSelector';
import { 
  DEFAULT_TIMEZONE, 
  formatDateWithTimezone, 
  getRelativeTime,
  toChinaDateString
} from '@/utils/dateUtils';

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  status: string;
  birthDateTime?: string;
}

export default function BaziBookingPage() {
  // 用户状态
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();
  
  // 表单状态
  const [birthDateTime, setBirthDateTime] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminNotified, setAdminNotified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  // 时区选择
  const [selectedTimezone, setSelectedTimezone] = useState<string>(DEFAULT_TIMEZONE);
  
  // 当前日历视图和数据
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityData, setAvailabilityData] = useState<{[date: string]: boolean}>({});
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 强制刷新触发器
  
  // 取消确认对话框
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);



  // 支付方式选项
  const paymentOptions = [
    { id: 'wechat', name: '微信支付', icon: '📱' },
    { id: 'alipay', name: '支付宝', icon: '💰' },
    { id: 'paypal', name: 'PayPal', icon: '🌐' },
    { id: 'creditcard', name: '信用卡', icon: '💳' }
  ];

  // 检查用户登录状态并获取数据
  useEffect(() => {
    // 检查用户是否登录
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      
      // 设置默认邮箱
      if (userData.email) {
        setEmail(userData.email);
      }
    } else {
      router.replace('/user/login');
    }
  }, [router]);

  // 获取可用性数据和用户预约
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 获取可用性数据
        const availabilityRes = await fetchWithAuth('/api/appointments/availability');
        const availabilityData = await availabilityRes.json();
        
        if (availabilityData.success) {
          setAvailabilityData(availabilityData.data || {});
        }
        
        // 获取用户预约
        if (user.username) {
          const appointmentsRes = await fetch(`/api/appointments?username=${encodeURIComponent(user.username)}`);
          const appointmentsData = await appointmentsRes.json();
          
          if (appointmentsData.success) {
            setUserAppointments(appointmentsData.data || []);
          }
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请刷新重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, refreshTrigger]);
  

  
  // 生成本月所有日期的日历数据
  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几（0是星期日，1是星期一，以此类推）
    const firstDayOfWeek = firstDay.getDay();
    
    // 计算需要显示的前一个月的天数
    const prevMonthDays = [];
    if (firstDayOfWeek !== 1) { // 如果第一天不是星期一，显示前一个月的部分天数
      const daysToShow = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = daysToShow - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        const dateString = toChinaDateString(date.toISOString());
        prevMonthDays.push({
          date: dateString,
          day,
          currentMonth: false,
          isAvailable: false,
          isBooked: false
        });
      }
    }
    
    // 当前月的天数
    const currentMonthDays = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = toChinaDateString(date.toISOString());
      
      // 判断是否为过去的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPastDate = date < today;
      
      // 检查是否是用户已预约的日期
      const isUserBooked = userAppointments.some(
        app => toChinaDateString(app.date) === dateString && app.status !== 'cancelled'
      );
      
      // 检查日期可用性（从API获取的数据）
      const isUnavailable = availabilityData[dateString] === false;
      
      // 检查当前用户当天预约状态
      const userApp = userAppointments.find(app => toChinaDateString(app.date) === dateString && app.status !== 'cancelled');
      const isUserConfirmed = !!userApp && userApp.status === 'confirmed';
      
      // 只要不是没空，都可预约
      const isAvailable = !isUnavailable;
      
      currentMonthDays.push({
        date: dateString,
        day,
        currentMonth: true,
        isAvailable,
        isBooked: isUserBooked,
        isUnavailable,
        isPastDate,
        isUserConfirmed
      });
    }
    
    // 计算需要显示的下一个月的天数，确保日历总共显示42天（6周）
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = toChinaDateString(date.toISOString());
      nextMonthDays.push({
        date: dateString,
        day,
        currentMonth: false,
        isAvailable: false,
        isBooked: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // 根据当前选择的年月生成日历数据
  const calendarDays = generateCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  
  // 倒计时重定向效果
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      router.push('/user/profile');
    }
  }, [redirectCountdown, router]);

  // 验证邮箱格式
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 处理提交
  const handleSubmit = () => {
    // 重置错误信息
    setError(null);
    
    // 验证表单
    if (!birthDateTime) {
      setError('请先填写出生时间');
      return;
    }
    
    if (!email) {
      setError('请填写您的邮箱地址');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('请填写正确的邮箱格式');
      return;
    }
    
    if (!selectedDate) {
      setError('请先选择日期');
      return;
    }
    
    // 确认所选日期可用
    const selectedDayInfo = calendarDays.find(day => day.date === selectedDate);
    if (!selectedDayInfo || !selectedDayInfo.isAvailable) {
      setError('所选日期不可预约，请重新选择');
      return;
    }
    
    // 显示确认对话框
    setShowConfirm(true);
  };
  
  // 确认提交，显示支付窗口
  const handleConfirm = () => {
    setShowConfirm(false);
    setShowPayment(true);
  };
  
  // 处理支付方式选择
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };
  
  // 创建预约
  const createAppointment = async () => {
    if (!user) return false;
    

    setError(null);
    
    try {
      // 创建预约数据对象
      const appointmentData = {
        username: user.username,
        email: email,
        birthDateTime: birthDateTime,
        date: selectedDate,
        service: '八字算命',
        time: '19:00-21:00',
        paymentMethod: paymentMethod,
        // 添加可能需要的额外字段
        name: user.username, // 后端模型需要name字段
      };
      
      // 获取认证头
      const headers = getAuthHeaders();
      console.log('预约提交使用认证头:', headers.Authorization ? '有效token' : '无token');
      
      // 发送到API创建预约
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': headers.Authorization
        },
        body: JSON.stringify(appointmentData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('预约创建失败:', result);
        throw new Error(result.message || '创建预约失败');
      }
      
      setAdminNotified(true);
      return true;
    } catch (err) {
      console.error('创建预约失败:', err);
      setError(err instanceof Error ? err.message : '创建预约失败，请稍后重试');
      return false;
    } finally {

    }
  };
  
  // 处理付款流程
  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('请选择支付方式');
      return;
    }
    
    // 模拟支付处理
    setIsProcessingPayment(true);
    setError(null);
    
    try {
      // 模拟支付请求延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 创建预约
      const success = await createAppointment();
      
      if (success) {
        // 显示预约成功信息
        setSuccessMessage(`预约成功！您的八字算命服务已安排在 ${selectedDate} 中国时间19:00-21:00。我们将通过邮件 ${email} 发送详细信息。`);
        
        // 刷新数据
        setRefreshTrigger(prev => prev + 1);
        
        // 设置倒计时
        setRedirectCountdown(5);
      }
    } catch (error) {
      console.error('支付处理失败:', error);
      setError('支付处理失败，请稍后重试');
    } finally {
      setIsProcessingPayment(false);
      setShowPayment(false);
    }
  };
  
  // 取消预约
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: appointmentToCancel, 
          status: 'cancelled' 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 更新本地状态
        setUserAppointments(prev => 
          prev.map(app => 
            app.id === appointmentToCancel 
              ? { ...app, status: 'cancelled' } 
              : app
          )
        );
        
        // 显示成功消息
        setSuccessMessage('您的预约已成功取消');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // 刷新数据
        setRefreshTrigger(prev => prev + 1);
      } else {
        setError('取消预约失败：' + (result.message || '未知错误'));
      }
    } catch (err) {
      console.error('取消预约失败:', err);
      setError('取消预约失败，请稍后重试');
    } finally {
      setShowCancelConfirm(false);
      setAppointmentToCancel(null);
    }
  };

  // 手动刷新数据
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 必填项红色星号组件
  const RequiredMark = () => (
    <span className="text-red-500 ml-1">*</span>
  );
  
  // 获取日期样式
  const getDateClassName = (isAvailable: boolean, isBooked: boolean, isCurrent: boolean, isUnavailable: boolean, isPastDate: boolean, isUserConfirmed: boolean, date: string) => {
    let className = "w-10 h-10 flex items-center justify-center rounded-full ";
    
    if (!isCurrent) {
      className += "text-gray-400 opacity-50 cursor-default ";
    } else if (isPastDate) {
      className += "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70 ";
    } else if (isUserConfirmed) {
      className += "bg-green-500 text-white font-bold cursor-pointer hover:bg-green-600 ";
    } else if (isUnavailable) {
      className += "bg-red-100 text-red-800 ";
    } else if (isBooked) {
      className += "bg-[#FF6F61] text-white font-bold ";
    } else if (selectedDate === date) {
      className += "bg-[#FF6F61] text-white font-bold ring-2 ring-[#FF6F61] ";
    } else if (isAvailable) {
      className += "bg-white hover:bg-gray-100 border cursor-pointer ";
    }
    
    return className;
  };
  
  // 获取月份名称
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];
  
  // 格式化显示时间，带上时区信息
  const formatDisplayTime = (date: string, timeSlot: string = '19:00-21:00') => {
    // 组合日期和时间的开始部分
    const [startTime] = timeSlot.split('-');
    const dateTimeString = `${date}T${startTime}:00.000Z`;
    
    // 格式化为带时区的显示
    return formatDateWithTimezone(dateTimeString, selectedTimezone);
  };
  
  // 计算倒计时
  const calculateCountdown = (date: string) => {
    if (!date) return '';
    return getRelativeTime(date);
  };
  
  // 如果用户未登录，返回 null (useEffect 会重定向)
  if (!user) return null;

  // 查找用户当前的活跃预约
  const activeAppointment = userAppointments.find(
    app => app.status !== 'cancelled'
  );

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      {/* 成功消息和倒计时 */}
      {successMessage && !redirectCountdown && (
        <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {/* 预约成功消息和倒计时 */}
      {successMessage && redirectCountdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-center">
            <div className="text-green-600 text-5xl mb-4">
              <Check size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">预约成功</h3>
            <p className="mb-3">{successMessage}</p>
            {adminNotified && (
              <p className="flex items-center justify-center mb-6 text-blue-600">
                <Send size={16} className="mr-2" />
                预约信息已通知管理员
              </p>
            )}
            <p className="text-gray-500">
              {redirectCountdown !== null && `${redirectCountdown}秒后自动跳转到个人中心...`}
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        {/* 如果已有活跃预约，显示预约详情 */}
        {activeAppointment && (
          <div className="bg-white rounded-lg shadow-lg border border-green-500 p-6 mb-8">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-green-600 mb-4">您当前的预约</h2>
              <div className="flex space-x-2">
                <TimezoneSelector 
                  selectedTimezone={selectedTimezone}
                  onChange={setSelectedTimezone}
                />
              <button 
                onClick={() => {
                  setShowCancelConfirm(true);
                  setAppointmentToCancel(activeAppointment.id);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <X size={16} className="mr-1" /> 取消预约
              </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div><span className="font-semibold">预约日期:</span> {formatDisplayTime(activeAppointment.date, activeAppointment.time)}</div>
              <div><span className="font-semibold">服务项目:</span> {activeAppointment.service}</div>
              {activeAppointment.birthDateTime && (
                <div><span className="font-semibold">出生时间:</span> {activeAppointment.birthDateTime}</div>
              )}
              <div><span className="font-semibold">状态:</span> 
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm">
                  {activeAppointment.status === 'confirmed' ? '已确认' : '待确认'}
                </span>
              </div>
              {activeAppointment.date && (
                <div><span className="font-semibold">倒计时:</span> 
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {calculateCountdown(`${activeAppointment.date}T${activeAppointment.time.split('-')[0]}:00.000Z`)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              预约已成功创建，管理员将尽快确认。如需更改预约，请先取消当前预约再重新预约。
            </div>
          </div>
        )}
        
        {/* 刷新按钮和时区选择器 */}
        <div className="flex justify-between mb-4">
          <button 
            className="flex items-center text-[#FF6F61] hover:text-[#ff8a75] transition-colors"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </button>
          
          {!activeAppointment && (
            <TimezoneSelector 
              selectedTimezone={selectedTimezone}
              onChange={setSelectedTimezone}
            />
          )}
        </div>
        
        {/* 八字预约表单 */}
        <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">八字算命预约</h1>
          
          <div className="mb-2 text-sm text-gray-600">
            <span className="text-red-500">*</span> 表示必填项
          </div>
          
          {/* 出生时间输入框 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              您的出生时间<RequiredMark />
            </label>
            <input
              type="datetime-local"
              value={birthDateTime}
              onChange={(e) => setBirthDateTime(e.target.value)}
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
              disabled={!!activeAppointment}
            />
          </div>
          
          {/* 邮箱输入框 */}
          <div className="mb-6">
            <label className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <Mail className="mr-2 text-[#FF6F61]" size={16} />
              您的邮箱地址<RequiredMark />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              className="border border-[#FF6F61] rounded w-full py-2 px-3"
              required
              disabled={!!activeAppointment}
            />
            <p className="text-xs text-gray-500 mt-1">
              预约结果和相关信息将发送至此邮箱
            </p>
          </div>
          
          {/* 日历选择器 */}
          <div className="mb-6">
            <h2 className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <Calendar className="mr-2 text-[#FF6F61]" size={20} />
              选择预约日期<RequiredMark />
            </h2>
            
            <div className="border border-[#FF6F61] rounded-lg p-4">
              {/* 月份导航 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#FF6F61]">
                  {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 rounded border border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white transition-colors"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  >
                    上个月
                  </button>
                  <button 
                    className="px-3 py-1 rounded border border-[#FF6F61] text-[#FF6F61] hover:bg-[#FF6F61] hover:text-white transition-colors"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  >
                    下个月
                  </button>
                </div>
              </div>
            
              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                  <div key={day} className="text-center font-bold text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 显示日历 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo, i) => (
                  <div key={i} className="p-1 text-center">
                    <button
                      onClick={() => {
                        if (dayInfo.isUserConfirmed) {
                          router.push('/user/profile');
                        } else if (dayInfo.isAvailable && dayInfo.currentMonth && !activeAppointment && !dayInfo.isPastDate) {
                          setSelectedDate(dayInfo.date);
                        }
                      }}
                      disabled={(!dayInfo.isAvailable && !dayInfo.isUserConfirmed) || !dayInfo.currentMonth || !!activeAppointment || dayInfo.isPastDate}
                      className={getDateClassName(
                        !!dayInfo.isAvailable,
                        !!dayInfo.isBooked,
                        !!dayInfo.currentMonth,
                        !!dayInfo.isUnavailable,
                        !!dayInfo.isPastDate,
                        !!dayInfo.isUserConfirmed,
                        dayInfo.date
                      )}
                    >
                      {dayInfo.day}
                    </button>
                  </div>
                ))}
              </div>
              
              {/* 图例说明 */}
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm flex-wrap gap-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border rounded-full mr-1"></div>
                  <span>可预约</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#FF6F61] rounded-full mr-1 opacity-70"></div>
                  <span>不可预约</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#FF6F61] rounded-full mr-1 ring-2 ring-[#FF6F61]"></div>
                  <span>已选择</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
                  <span>已预约</span>
                </div>
              </div>
            </div>
            
            {/* 显示选择的日期 */}
            {selectedDate && !activeAppointment && (
              <div className="mt-4 text-[#FF6F61] font-semibold">
                已选择: {formatDisplayTime(selectedDate, '19:00-21:00')}
                <div className="text-xs text-gray-500 mt-1">
                  <Globe size={12} className="inline mr-1" /> 所有时间均以中国时间 (UTC+8) 为准，服务时间为晚上19:00-21:00
                </div>
              </div>
            )}
          </div>
          
          {/* 错误信息 */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* 提交按钮 */}
          {!activeAppointment && (
            <div className="flex justify-center">
              <Button
                className="bg-[#FF6F61] text-white px-6 py-2"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                提交预约
              </Button>
            </div>
          )}
          
          {activeAppointment && (
            <div className="text-center text-gray-500">
              您已有一个活跃预约，请先取消当前预约后再创建新预约。
            </div>
          )}
        </div>
      </div>
      
      {/* 确认对话框 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">确认预约</h3>
            <p className="mb-4">您确定要预约以下八字算命服务吗？</p>
            <p className="text-gray-700 mb-2">预约人: {user.username}</p>
            <p className="text-gray-700 mb-2">出生时间: {birthDateTime}</p>
            <p className="text-gray-700 mb-2">邮箱地址: {email}</p>
            <p className="text-gray-700 mb-2">预约日期: {formatDisplayTime(selectedDate!, '19:00-21:00')}</p>
            <div className="mb-6 mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
              <Globe size={12} className="inline mr-1" /> 预约日期和时间以中国时间 (UTC+8) 为准
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                className="bg-gray-300 text-gray-800"
                onClick={() => setShowConfirm(false)}
              >
                取消
              </Button>
              <Button
                className="bg-[#FF6F61] text-white"
                onClick={handleConfirm}
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 取消预约确认对话框 */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">取消预约</h3>
            <p className="mb-6">您确定要取消预约吗？取消后将无法恢复，需要重新预约。</p>
            
            <div className="flex justify-end space-x-2">
              <Button
                className="bg-gray-300 text-gray-800"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setAppointmentToCancel(null);
                }}
              >
                返回
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={handleCancelAppointment}
              >
                确认取消
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 支付窗口 */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">选择支付方式</h3>
              <span className="text-xl font-bold text-[#FF6F61]">¥199</span>
            </div>
            
            <p className="mb-4 text-gray-600">八字算命服务费用</p>
            
            <div className="space-y-2 mb-6">
              {paymentOptions.map(option => (
                <div 
                  key={option.id}
                  onClick={() => handlePaymentMethodSelect(option.id)}
                  className={`
                    p-3 border rounded-lg flex items-center cursor-pointer
                    ${paymentMethod === option.id 
                      ? 'border-[#FF6F61] bg-[#FF6F61]/10' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <span className="flex-1">{option.name}</span>
                  {paymentMethod === option.id && (
                    <div className="h-5 w-5 rounded-full bg-[#FF6F61] flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                className="bg-gray-300 text-gray-800"
                onClick={() => {
                  setShowPayment(false);
                  setError(null);
                  setPaymentMethod(null);
                }}
                disabled={isProcessingPayment}
              >
                取消
              </Button>
              <Button
                className="bg-[#FF6F61] text-white flex items-center"
                onClick={handlePayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2" size={16} />
                    立即支付
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 