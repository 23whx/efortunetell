import { redirect } from 'next/navigation';

export default function ImageManagement() {
  // Legacy VPS-local image management removed. Use Supabase Storage dashboard.
  redirect('/admin/dashboard');
}


