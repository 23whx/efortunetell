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
    <div className="min-h-screen bg-[#FFFACD] flex">
      <AdminSidebar activeItem="appointments" />
      <main className="flex-1 ml-0 md:ml-56 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-[#FF6F61] p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h1 className="text-2xl font-bold text-[#FF6F61]">需求列表</h1>
              <Button className="bg-[#FF6F61] text-white" onClick={load} disabled={loading}>
                刷新
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-10 text-gray-500">暂无记录</div>
            ) : (
              <div className="space-y-4">
                {rows.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-lg text-gray-800">{r.service_type}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {r.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Email: {r.email}</div>
                          <div>创建时间: {new Date(r.created_at).toLocaleString()}</div>
                          {r.birth_datetime && <div className="md:col-span-2">出生时间: {r.birth_datetime}</div>}
                          {r.notes && <div className="md:col-span-2">说明: {r.notes}</div>}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white border-none"
                          onClick={() => updateStatus(r.id, 'completed')}
                          disabled={busyId === r.id || r.status === 'completed'}
                        >
                          {busyId === r.id ? '处理中...' : '标记完成'}
                        </Button>
                        <Button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                          onClick={() => updateStatus(r.id, 'pending')}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? '处理中...' : '标记跟进'}
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white border-none"
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? '处理中...' : '删除'}
                        </Button>
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


