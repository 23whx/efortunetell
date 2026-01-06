'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, User, Phone, Clock, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/button';

type Appointment = {
  id: string;
  user_name: string;
  user_contact: string;
  birth_info: {
    birth_date: string;
    birth_time: string;
  };
  bazi: any;
  chat_summary: string;
  requirements: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes: string;
  created_at: string;
};

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAppointments((data || []) as Appointment[]);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateStatus = async (id: string, status: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      await loadAppointments();
      alert('状态更新成功');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('更新失败');
    }
  };
  
  const updateNotes = async (id: string, notes: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('appointments')
        .update({ admin_notes: notes })
        .eq('id', id);
      
      if (error) throw error;
      
      alert('备注保存成功');
    } catch (error) {
      console.error('Failed to update notes:', error);
      alert('保存失败');
    }
  };
  
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    
    const labels = {
      pending: '待处理',
      confirmed: '已确认',
      completed: '已完成',
      cancelled: '已取消',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      <AdminSidebar activeItem="appointments" />
      
      <main className="flex-1 ml-64 p-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">预约管理</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Appointment Management
              </p>
            </div>
            <Button onClick={loadAppointments} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '刷新'}
            </Button>
          </div>
          
          {/* Filter */}
          <div className="mb-6 flex gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); loadAppointments(); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-[#FF6F61] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? '全部' : status === 'pending' ? '待处理' : status === 'confirmed' ? '已确认' : status === 'completed' ? '已完成' : '已取消'}
              </button>
            ))}
          </div>
          
          {/* List */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold">暂无预约记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="group p-6 rounded-2xl border border-gray-100 hover:border-[#FF6F61]/20 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowDetail(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusBadge(appointment.status)}
                          <span className="text-xs text-gray-400">
                            {new Date(appointment.created_at).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">{appointment.user_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{appointment.user_contact}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{appointment.birth_info?.birth_date}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{appointment.birth_info?.birth_time}</span>
                          </div>
                        </div>
                        
                        {appointment.requirements && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            需求：{appointment.requirements}
                          </p>
                        )}
                      </div>
                      
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-50 rounded-xl">
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Detail Modal */}
      {showDetail && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black">预约详情</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">姓名</label>
                  <p className="font-bold">{selectedAppointment.user_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">联系方式</label>
                  <p className="font-bold">{selectedAppointment.user_contact}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">出生日期</label>
                  <p className="font-bold">{selectedAppointment.birth_info?.birth_date}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1 block">出生时间</label>
                  <p className="font-bold">{selectedAppointment.birth_info?.birth_time}</p>
                </div>
              </div>
              
              {/* Bazi */}
              {selectedAppointment.bazi && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">八字信息</label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="text-sm">{JSON.stringify(selectedAppointment.bazi, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {/* Chat Summary */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">AI咨询记录摘要</label>
                <div className="bg-blue-50 rounded-xl p-4">
                  <pre className="text-sm whitespace-pre-wrap">{selectedAppointment.chat_summary}</pre>
                </div>
              </div>
              
              {/* Requirements */}
              {selectedAppointment.requirements && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">用户需求</label>
                  <p className="bg-gray-50 rounded-xl p-4 text-sm">{selectedAppointment.requirements}</p>
                </div>
              )}
              
              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">状态</label>
                <div className="flex gap-2">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedAppointment.id, status)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedAppointment.status === status
                          ? 'bg-[#FF6F61] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'pending' ? '待处理' : status === 'confirmed' ? '已确认' : status === 'completed' ? '已完成' : '已取消'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Admin Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">管理员备注</label>
                <textarea
                  defaultValue={selectedAppointment.admin_notes || ''}
                  onBlur={(e) => updateNotes(selectedAppointment.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FF6F61]/20 focus:border-[#FF6F61] outline-none transition-all"
                  rows={4}
                  placeholder="添加备注..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
