import { ReactNode } from 'react';
import Navbar from '@/components/navbar';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/user/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    redirect('/blog');
  }

  return (
    <>
      <Navbar />
      <div className="pt-20">{children}</div>
    </>
  );
}