'use client';
import { Star, Calendar, Hexagon, Shield } from 'lucide-react';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FortunePage() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  const services = [
    {
      id: 1,
      name: '八字算命',
      description: '通过出生年月日时推算命理，分析运势走向',
      price: '¥199',
      icon: <Star className="text-primary" />,
      buttonText: '预约',
      path: '/fortune/bazi'
    },
    {
      id: 2,
      name: '梅花易数',
      description: '以梅花易数推演事物发展，预测吉凶祸福',
      price: '¥99',
      icon: <Hexagon className="text-primary" />,
      buttonText: '立即测算',
      path: ''
    },
    {
      id: 3,
      name: '大六壬',
      description: '古代三式之一，预测人事吉凶的占卜术',
      price: '¥159',
      icon: <Shield className="text-primary" />,
      buttonText: '立即测算',
      path: ''
    },
    {
      id: 4,
      name: '阴盘奇门',
      description: '奇门遁甲分支，用于预测和决策的术数',
      price: '¥299',
      icon: <Calendar className="text-primary" />,
      buttonText: '立即测算',
      path: ''
    },
  ];

  return (
    <div className="min-h-screen p-8 bg-[#FFFACD]">
      <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">玄学预测服务</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-secondary rounded-full">
                {service.icon}
              </div>
              <h2 className="text-xl font-semibold">{service.name}</h2>
            </div>
            <p className="text-muted-foreground mb-4">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-primary font-medium">{service.price}</span>
              <Button
                onClick={() => {
                  if (!user) {
                    router.push('/user/login');
                  } else if (service.path) {
                    router.push(service.path);
                  } else {
                    alert('已预约（模拟）');
                  }
                }}
              >
                {service.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}