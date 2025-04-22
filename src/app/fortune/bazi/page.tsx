'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Calendar, Mail, CreditCard, Check, Send } from 'lucide-react';

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
  const [isSendingToAdmin, setIsSendingToAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminNotified, setAdminNotified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  // 日历数据 - 模拟可预约和不可预约的日期
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i + 1);
    // 随机生成一些不可预约的日期(珊瑚红色)
    const isAvailable = Math.random() > 0.3;
    return {
      date: date.toISOString().split('T')[0],
      isAvailable
    };
  });

  // 支付方式选项
  const paymentOptions = [
    { id: 'wechat', name: '微信支付', icon: '📱' },
    { id: 'alipay', name: '支付宝', icon: '💰' },
    { id: 'paypal', name: 'PayPal', icon: '🌐' },
    { id: 'creditcard', name: '信用卡', icon: '💳' }
  ];

  useEffect(() => {
    // 检查用户是否登录
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.replace('/user/login');
    }
  }, [router]);
  
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
  
  // 发送预约信息给管理员
  const sendBookingInfoToAdmin = async () => {
    if (!user) return;
    
    setIsSendingToAdmin(true);
    
    // 创建预约数据对象
    const bookingData = {
      userName: user.username,
      userEmail: email,
      birthDateTime: birthDateTime,
      appointmentDate: selectedDate,
      appointmentTime: '中国时间19:00-21:00',
      paymentMethod: paymentMethod,
      bookingTime: new Date().toISOString(),
      serviceName: '八字算命',
      servicePrice: '¥199'
    };
    
    try {
      // 模拟API请求 - 实际项目中应替换为真实API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功发送
      console.log('预约信息已发送给管理员:', bookingData);
      setAdminNotified(true);
    } catch (err) {
      console.error('发送预约信息失败:', err);
    } finally {
      setIsSendingToAdmin(false);
    }
  };
  
  // 处理付款流程
  const handlePayment = () => {
    if (!paymentMethod) {
      setError('请选择支付方式');
      return;
    }
    
    // 模拟支付处理
    setIsProcessingPayment(true);
    
    // 模拟支付请求延迟
    setTimeout(async () => {
      setIsProcessingPayment(false);
      setShowPayment(false);
      
      // 支付成功后发送预约信息给管理员
      await sendBookingInfoToAdmin();
      
      // 显示预约成功信息
      setSuccessMessage(`预约成功！您的八字算命服务已安排在 ${selectedDate} 中国时间19:00-21:00`);
      
      // 设置倒计时
      setRedirectCountdown(3);
      
      // 模拟发送订单到后台
      console.log('订单已发送', { 
        birthDateTime, 
        email, 
        appointmentDate: selectedDate,
        paymentMethod
      });
    }, 2000);
  };

  // 必填项红色星号组件
  const RequiredMark = () => (
    <span className="text-red-500 ml-1">*</span>
  );
  
  // 如果用户未登录，返回 null (useEffect 会重定向)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFFACD] p-8">
      {/* 成功消息和倒计时 */}
      {successMessage && (
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
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
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
          />
          <p className="text-xs text-gray-500 mt-1">
            预约结果和相关信息将发送至此邮箱
          </p>
        </div>
        
        {/* 日历选择器 */}
        <div className="mb-6">
          <h2 className="flex items-center text-gray-700 text-sm font-bold mb-4">
            <Calendar className="mr-2 text-[#FF6F61]" size={20} />
            选择预约日期<RequiredMark />
          </h2>
          
          <div className="grid grid-cols-7 gap-1">
            {['一', '二', '三', '四', '五', '六', '日'].map(day => (
              <div key={day} className="text-center font-bold text-sm py-2">
                {day}
              </div>
            ))}
            
            {/* 填充空白日期，使日历从星期一开始 */}
            {Array.from({ length: new Date(calendarDays[0].date).getDay() || 7 - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 text-center"></div>
            ))}
            
            {/* 显示可预约和不可预约的日期 */}
            {calendarDays.map((day) => (
              <div
                key={day.date}
                onClick={() => day.isAvailable && setSelectedDate(day.date)}
                className={`
                  p-2 text-center rounded-md cursor-pointer text-sm
                  ${day.isAvailable 
                    ? 'bg-white hover:bg-gray-100 border' 
                    : 'bg-[#FF6F61] text-white border border-[#FF6F61] opacity-70 cursor-not-allowed'}
                  ${selectedDate === day.date ? 'ring-2 ring-[#FF6F61] font-bold' : ''}
                `}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          
          {/* 显示选择的日期 */}
          {selectedDate && (
            <div className="mt-4 text-[#FF6F61] font-semibold">
              已选择: {selectedDate}
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
        <div className="flex justify-center">
          <Button
            className="bg-[#FF6F61] text-white px-6 py-2"
            onClick={handleSubmit}
          >
            提交预约
          </Button>
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
            <p className="text-gray-700 mb-2">预约日期: {selectedDate}</p>
            <p className="text-gray-700 mb-6">服务时间: 中国时间19:00-21:00</p>
            
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