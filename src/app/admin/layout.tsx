import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';
import { SITE_URL } from '@/lib/site';
import SiteFrame from '../site-frame';

export { viewport } from '../site-frame';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Admin',
  robots: { index: false, follow: false },
};

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
    <SiteFrame lang="en" dir="ltr" locale={defaultLocale}>
      <div className="min-h-screen bg-[#faf9f6]">
        {children}
      </div>
    </SiteFrame>
  );
}
