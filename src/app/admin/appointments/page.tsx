'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Check, X, Mail } from 'lucide-react';
import AdminSidebar from '@/components/shared/AdminSidebar';

// 定义预约类型
type Appointment = {
  id: string;
  date: string;
  username: string;
  email: string;
  service: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

// 定义管理员可用性类型
type Availability = {
  [date: string]: boolean;
};

// 模拟预约数据
const mockAppointments: Appointment[] = [
  { 
    id: '1', 
    date: '2024-06-10', 
    username: '张三', 
    email: 'zhangsan@example.com', 
    service: '八字算命', 
    time: '19:00-21:00',
    status: 'confirmed'
  },
  { 
    id: '2', 
    date: '2024-06-15', 
    username: '李四', 
    email: 'lisi@example.com', 
    service: '八字算命', 
    time: '14:00-16:00',
    status: 'pending'
  },
  { 
    id: '3', 
    date: '2024-06-20', 
    username: '王五', 
    email: 'wangwu@example.com', 
    service: '八字算命', 
    time: '10:00-12:00',
    status: 'confirmed'
  }
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [availability, setAvailability] = useState<Availability>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 检查管理员登录状态
  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      setAdmin(JSON.parse(stored));
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  // 生成一个月的日期
  const generateDaysForMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几（0是星期日，1是星期一，以此类推）
    const firstDayOfWeek = firstDay.getDay();
    
    // 计算需要显示的前一个月的天数
    const prevMonthDays = [];
    if (firstDayOfWeek !== 0) { // 如果第一天不是星期日，显示前一个月的部分天数
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        prevMonthDays.push({
          date: date.toISOString().split('T')[0],
          day,
          currentMonth: false
        });
      }
    }
    
    // 当月的天数
    const currentMonthDays = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      currentMonthDays.push({
        date: date.toISOString().split('T')[0],
        day,
        currentMonth: true
      });
    }
    
    // 计算需要显示的下一个月的天数，确保日历总共显示42天（6周）
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      nextMonthDays.push({
        date: date.toISOString().split('T')[0],
        day,
        currentMonth: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // 切换管理员可用性状态
  const toggleAvailability = (date: string) => {
    setAvailability(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // 处理鼠标悬停事件
  const handleMouseOver = (date: string, event: React.MouseEvent) => {
    const appointment = appointments.find(app => app.date === date);
    if (appointment) {
      setHoveredDate(date);
      setHoveredAppointment(appointment);
      setTooltipPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
    }
  };

  // 处理鼠标离开事件
  const handleMouseOut = () => {
    setHoveredDate(null);
    setHoveredAppointment(null);
  };

  // 获取当月的日期
  const daysInMonth = generateDaysForMonth(
    currentDate.getFullYear(), 
    currentDate.getMonth()
  );

  // 显示预约详情
  const showAppointmentDetails = (date: string) => {
    setSelectedDate(date);
  };

  // 确认预约
  const confirmAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, status: 'confirmed' } 
          : app
      )
    );
  };

  // 取消预约
  const cancelAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, status: 'cancelled' } 
          : app
      )
    );
  };

  // 获取日期状态的类名
  const getDateClassName = (date: string, isCurrentMonth: boolean) => {
    const appointment = appointments.find(app => app.date === date);
    const isAvailable = availability[date];
    
    let className = "w-10 h-10 flex items-center justify-center rounded-full ";
    
    if (!isCurrentMonth) {
      className += "text-gray-400 ";
    } else if (appointment) {
      className += "bg-[#FF6F61] text-white font-bold ";
    } else if (isAvailable) {
      className += "bg-green-100 text-green-800 ";
    } else if (isAvailable === false) {
      className += "bg-red-100 text-red-800 ";
    } else {
      className += "hover:bg-gray-100 ";
    }
    
    return className;
  };

  if (!admin) return null;

  // 获取月份名称
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFACD]">
      <AdminSidebar activeItem="appointments" />

      <main className="flex-1 p-8 ml-56">
        <h1 className="text-3xl font-bold mb-8 text-[#FF6F61] flex items-center">
          <CalendarIcon className="mr-2" /> 预约管理
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 日历部分 */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-[#FF6F61]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#FF6F61]">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </h2>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 rounded bg-[#FF6F61] text-white"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                >
                  上个月
                </button>
                <button 
                  className="px-3 py-1 rounded bg-[#FF6F61] text-white"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                >
                  下个月
                </button>
              </div>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
                <div key={index} className="text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((dayInfo, index) => (
                <div 
                  key={index} 
                  className="p-1 text-center"
                  onClick={() => showAppointmentDetails(dayInfo.date)}
                >
                  <button
                    className={getDateClassName(dayInfo.date, dayInfo.currentMonth)}
                    onClick={() => dayInfo.currentMonth && toggleAvailability(dayInfo.date)}
                    onMouseOver={(e) => handleMouseOver(dayInfo.date, e)}
                    onMouseOut={handleMouseOut}
                  >
                    {dayInfo.day}
                  </button>
                  {appointments.find(app => app.date === dayInfo.date) && (
                    <div className="text-xs mt-1 truncate">
                      {appointments.find(app => app.date === dayInfo.date)?.username}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 图例说明 */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#FF6F61] rounded-full mr-1"></div>
                <span>已预约</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded-full mr-1"></div>
                <span>有空</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded-full mr-1"></div>
                <span>没空</span>
              </div>
            </div>
          </div>

          {/* 预约详情部分 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-[#FF6F61]">
            <h2 className="text-xl font-bold mb-4 text-[#FF6F61]">
              {selectedDate ? `${selectedDate} 预约详情` : '预约详情'}
            </h2>

            {selectedDate ? (
              appointments.filter(app => app.date === selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .filter(app => app.date === selectedDate)
                    .map(appointment => (
                      <div 
                        key={appointment.id} 
                        className="border p-4 rounded-lg shadow-sm bg-[#FFFACD]"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{appointment.username}</h3>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status === 'confirmed' 
                              ? '已确认' 
                              : appointment.status === 'cancelled'
                                ? '已取消'
                                : '待确认'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-gray-500" />
                            <span>{appointment.email}</span>
                          </div>
                          <div><span className="text-gray-500">服务:</span> {appointment.service}</div>
                          <div><span className="text-gray-500">时间:</span> {appointment.time}</div>
                        </div>

                        {appointment.status === 'pending' && (
                          <div className="mt-4 flex space-x-2">
                            <button 
                              className="flex items-center px-3 py-1 bg-green-500 text-white rounded"
                              onClick={() => confirmAppointment(appointment.id)}
                            >
                              <Check size={16} className="mr-1" /> 确认
                            </button>
                            <button 
                              className="flex items-center px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => cancelAppointment(appointment.id)}
                            >
                              <X size={16} className="mr-1" /> 取消
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div>
                  <p className="text-gray-500">该日期没有预约</p>
                  <div className="mt-4">
                    <button 
                      className={`px-3 py-1 rounded ${
                        availability[selectedDate] 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}
                      onClick={() => toggleAvailability(selectedDate)}
                    >
                      {availability[selectedDate] ? '设为没空' : '设为有空'}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <p className="text-gray-500">请选择一个日期查看预约详情</p>
            )}
          </div>
        </div>

        {/* 工具提示 - 显示用户邮箱 */}
        {hoveredDate && hoveredAppointment && (
          <div 
            className="fixed bg-white p-2 rounded shadow-md border border-gray-200 z-50"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y + 10}px`,
            }}
          >
            <p className="text-sm font-medium">{hoveredAppointment.email}</p>
          </div>
        )}
      </main>
    </div>
  );
} 