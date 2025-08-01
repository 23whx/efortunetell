'use client';
import { RiPokerHeartsLine, RiPokerClubsLine, RiPokerDiamondsLine, RiPokerSpadesLine } from 'react-icons/ri';
import { Brain } from 'lucide-react';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuthHeaders } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FortunePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const userData = stored ? JSON.parse(stored) : null;
    const token = localStorage.getItem('token');
    
    console.log('Fortune页面 - 从localStorage读取的用户数据:', userData);
    console.log('Fortune页面 - 从localStorage读取的token:', token ? '有token' : '无token');
    
    setUser(userData);
    // 只要有token和用户信息就认为已登录
    setIsLoggedIn(!!(token && userData && userData.username));
  }, []);

  const services = [
    {
      id: 1,
      name: t('service.bazi'),
      description: t('service.bazi.description'),
      price: '$618',
      icon: <RiPokerHeartsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'bazi'
    },
    {
      id: 2,
      name: t('service.qimen'),
      description: t('service.qimen.description'),
      price: '$186',
      icon: <RiPokerClubsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'qimen'
    },
    {
      id: 3,
      name: t('service.liuren'),
      description: t('service.liuren.description'),
      price: '$168',
      icon: <RiPokerDiamondsLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'liuren'
    },
    {
      id: 4,
      name: t('service.naming'),
      description: t('service.naming.description'),
      price: '$816',
      icon: <RiPokerSpadesLine className="text-primary text-2xl" />,
      buttonText: t('fortune.getInTouch'),
      serviceType: 'naming'
    },
    {
      id: 5,
      name: '八字性格画像生成器',
      description: '基于传统命理学与AI技术，生成个性化性格画像与五行分析图表',
      price: '免费',
      icon: <Brain className="text-primary text-2xl" />,
      buttonText: '立即生成',
      serviceType: 'bazi-persona'
    }
  ];

  const createAppointmentRecord = async (serviceType: string, serviceName: string, price: string) => {
    if (!isLoggedIn || !user) {
      console.log('createAppointmentRecord: 用户未登录');
      return false;
    }

    try {
      setIsCreatingAppointment(true);
      
      const appointmentData = {
        username: user.username,
        service: serviceName,
        serviceType: serviceType,
        price: price,
        date: new Date().toISOString().split('T')[0],
        time: 'TBD',
        status: 'contact_requested',
        notes: `User requested contact for ${serviceName} service`,
        birthDateTime: new Date().toISOString()
      };

      console.log('发送预约数据:', appointmentData);
      console.log('使用的认证头:', getAuthHeaders());

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('预约记录创建成功:', result.data);
        return true;
      } else {
        console.error('创建预约记录失败:', result.message);
        return false;
      }
    } catch (error) {
      console.error('创建预约记录时出错:', error);
      return false;
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const handleGetInTouch = async (service: { serviceType: string; name: string; price: string }) => {
    // 八字性格画像生成器直接跳转，不需要登录
    if (service.serviceType === 'bazi-persona') {
      router.push('/fortune/bazi-persona');
      return;
    }

    if (!isLoggedIn || !user) {
      console.log('用户未登录，跳转到登录页面');
      router.push('/user/login');
      return;
    }

    console.log('用户已登录，开始创建预约记录');
    // 创建预约记录
    await createAppointmentRecord(
      service.serviceType, 
      service.name, 
      service.price
    );

    // 无论是否成功创建记录，都跳转到联系页面
    router.push('/contact');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#FFFACD]">
      <h1 className="text-xl md:text-2xl font-bold text-[#FF6F61] mb-4 md:mb-6 text-center">
        {t('fortune.title')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-4 md:p-6 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="p-2 bg-secondary rounded-full flex-shrink-0">
                {service.icon}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                {service.name}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <span className="text-primary font-medium text-lg md:text-xl">
                {service.price}
              </span>
              <Button
                onClick={() => handleGetInTouch(service)}
                disabled={isCreatingAppointment}
                className="bg-[#FF6F61] hover:bg-[#FF5A4D] text-white w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 text-sm md:text-base"
              >
                {isCreatingAppointment ? t('common.loading') + '...' : service.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}