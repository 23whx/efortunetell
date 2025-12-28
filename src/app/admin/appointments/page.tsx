'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/shared/AdminSidebar';
import Button from '@/components/ui/button';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type BookingRow = {
  id: string;
  service_type: string;
  email: string;
  birth_datetime: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function AdminAppointmentsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('id,service_type,email,birth_datetime,notes,status,created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setRows((data || []) as BookingRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失败');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('确定要删除该记录吗？')) return;
    setBusyId(id);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex">
      <AdminSidebar activeItem="appointments" />
      <main className="flex-1 ml-64 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">需求管理</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Appointments & Inquiries</p>
            </div>
            <button 
              className="px-8 py-3 rounded-2xl bg-[#FF6F61] text-white font-black shadow-xl shadow-[#FF6F61]/20 hover:scale-105 active:scale-95 transition-all"
              onClick={load} 
              disabled={loading}
            >
              刷新数据
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 p-8">
            {error && (
              <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <span className="font-bold">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin shadow-lg shadow-[#FF6F61]/20"></div>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-4">
                  <span className="text-2xl text-gray-300">Empty</span>
                </div>
                <p className="text-gray-400 font-bold">暂无记录</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {rows.map((r) => (
                  <div key={r.id} className="group p-8 rounded-[32px] border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-500">
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 rounded-full bg-white border border-gray-100 text-[#FF6F61] text-xs font-black uppercase tracking-widest shadow-sm">
                            {r.service_type}
                          </span>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                            r.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {r.status === 'completed' ? '已完成' : '待处理'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-gray-700">{r.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Date</p>
                            <p className="text-sm font-bold text-gray-700">{new Date(r.created_at).toLocaleString()}</p>
                          </div>
                          {r.birth_datetime && (
                            <div className="md:col-span-2 space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birth Datetime</p>
                              <p className="text-sm font-bold text-gray-700 italic">{r.birth_datetime}</p>
                            </div>
                          )}
                          {r.notes && (
                            <div className="md:col-span-2 space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes / Message</p>
                              <p className="text-sm font-bold text-gray-700 leading-relaxed bg-white/50 p-4 rounded-2xl border border-gray-100/50">{r.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[180px] justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateStatus(r.id, 'completed')}
                          disabled={busyId === r.id || r.status === 'completed'}
                          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            r.status === 'completed' 
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                              : 'bg-green-500 text-white shadow-lg shadow-green-200 hover:scale-105 active:scale-95'
                          }`}
                        >
                          {busyId === r.id ? '...' : '标记完成'}
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'pending')}
                          disabled={busyId === r.id || r.status === 'pending'}
                          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                            r.status === 'pending'
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:scale-105 active:scale-95'
                          }`}
                        >
                          标记待处理
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                          className="w-full py-3 rounded-2xl bg-white border border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
                        >
                          {busyId === r.id ? '...' : '删除记录'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


