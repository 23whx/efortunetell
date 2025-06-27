'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2, RefreshCw, Calendar, User, Mail, Clock } from 'lucide-react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { API_BASE_URL } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';

// 定义预约类型
type Appointment = {
  _id: string;
  user: {
    _id: string;
    username: string;
    email?: string;
  };
  service: string;
  serviceType?: string;
  price: number;
  status: 'contact_requested' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  serviceDate: string;
  timeSlot: string;
  createdAt: string;
  name: string;
  email: string;
  question?: string;
};

// 定义管理员类型
type Admin = {
  username: string;
  token: string;
  role?: string;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'unprocessed' | 'processed'>('unprocessed');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 检查管理员登录状态
  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) {
      try {
        const adminData = JSON.parse(stored);
        
        if (!adminData || !adminData.token || !adminData.username) {
          console.error('管理员信息不完整，重定向到登录页');
          localStorage.removeItem('admin');
          router.replace('/admin/login');
        } else {
          if (!adminData.role) {
            adminData.role = 'admin';
            localStorage.setItem('admin', JSON.stringify(adminData));
          }
          setAdmin(adminData);
        }
      } catch (e) {
        console.error('解析管理员数据失败:', e);
        localStorage.removeItem('admin');
        router.replace('/admin/login');
      }
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAppointments(data.data);
        } else {
          setError(data.message || t('error.unknownError'));
        }
      } else {
        setError(`${t('error.serverError')}: ${response.status}`);
      }
    } catch (error) {
      console.error('获取预约数据时出错:', error);
      setError(t('error.networkError'));
    } finally {
      setIsLoading(false);
    }
  }, [admin?.token, t]);

  // 获取预约数据
  useEffect(() => {
    if (!admin) return;
    fetchAppointments();
  }, [admin, fetchAppointments]);

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

  // 过滤预约记录
  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'unprocessed') {
      return appointment.status === 'contact_requested' || appointment.status === 'pending';
    } else {
      return appointment.status === 'confirmed' || appointment.status === 'completed' || appointment.status === 'cancelled';
    }
  });

  // 确认预约（标记为已完成）
  const confirmAppointment = async (appointmentId: string) => {
    if (!confirm(t('admin.appointments.confirmComplete'))) return;

    setProcessingId(appointmentId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin?.token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        // 更新本地状态
        setAppointments(prev => 
          prev.map(appointment => 
            appointment._id === appointmentId 
              ? { ...appointment, status: 'completed' as const }
              : appointment
          )
        );
        alert(t('admin.appointments.completed'));
      } else {
        const errorData = await response.json();
        alert(`${t('admin.appointments.operationFailed')}: ${errorData.message || t('error.unknownError')}`);
      }
    } catch (error) {
      console.error('确认预约时出错:', error);
      alert(t('admin.appointments.operationFailed'));
    } finally {
      setProcessingId(null);
    }
  };

  // 删除预约
  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm(t('admin.appointments.confirmDelete'))) return;

    setDeletingId(appointmentId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin?.token}`
        }
      });

      if (response.ok) {
        // 从本地状态中移除已删除的预约
        setAppointments(prev => prev.filter(appointment => appointment._id !== appointmentId));
        alert(t('admin.appointments.deleted'));
      } else {
        const errorData = await response.json();
        alert(`${t('admin.appointments.operationFailed')}: ${errorData.message || t('error.unknownError')}`);
      }
    } catch (error) {
      console.error('删除预约时出错:', error);
      alert(t('admin.appointments.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-[#FFFACD]">
      <AdminSidebar activeItem="appointments" />

      <main className="flex-1 p-8 ml-56">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#FF6F61] flex items-center">
            <Calendar className="mr-2" /> {t('admin.appointments.title')}
          </h1>
          
          <button 
            className="flex items-center px-4 py-2 bg-[#FF6F61] text-white rounded-lg hover:bg-[#ff8a75] transition-colors"
            onClick={fetchAppointments}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="bg-white rounded-lg shadow-md border border-[#FF6F61] p-6">
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { key: 'unprocessed', label: t('admin.appointments.unprocessed') },
              { key: 'processed', label: t('admin.appointments.processed') }
            ].map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-b-2 border-[#FF6F61] text-[#FF6F61]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.key as 'unprocessed' | 'processed')}
              >
                {tab.label}
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  {tab.key === 'unprocessed' 
                    ? appointments.filter(a => a.status === 'contact_requested' || a.status === 'pending').length
                    : appointments.filter(a => a.status === 'confirmed' || a.status === 'completed' || a.status === 'cancelled').length
                  }
                </span>
              </button>
            ))}
          </div>

          {/* 预约列表 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map(appointment => {
                const statusInfo = formatStatus(appointment.status);
                return (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {formatServiceName(appointment.service, appointment.serviceType)}
                        </h3>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium mt-1 ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        {activeTab === 'unprocessed' && (
                          <>
                            <button
                              onClick={() => confirmAppointment(appointment._id)}
                              disabled={processingId === appointment._id}
                              className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                            >
                              <Check size={14} className="mr-1" />
                              {processingId === appointment._id ? t('admin.appointments.processing') : t('common.confirm')}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteAppointment(appointment._id)}
                          disabled={deletingId === appointment._id}
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={14} className="mr-1" />
                          {deletingId === appointment._id ? t('admin.appointments.deleting') : t('common.delete')}
                        </button>
                      </div>
                    </div>
                    
                    {/* 预约信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span>{t('common.username')}: {appointment.user?.username || appointment.name || '未知用户'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2" />
                        <span>{t('common.email')}: {appointment.user?.email || appointment.email || '未提供'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <span>{t('admin.appointments.bookingTime')}: {formatDate(appointment.createdAt)}</span>
                      </div>
                    </div>

                    {/* 额外信息 */}
                    <div className="mt-3 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">💰</span>
                        <span>{t('common.price')}: ${appointment.price}</span>
                      </div>
                      {appointment.question && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <span className="font-medium text-yellow-700">{t('admin.appointments.notes')}: </span>
                          <span className="text-yellow-600">{appointment.question}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {activeTab === 'unprocessed' ? t('admin.appointments.noUnprocessed') : t('admin.appointments.noProcessed')}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 