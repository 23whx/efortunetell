import { redirect } from 'next/navigation';

export default function CommentManagement() {
  // Comments module removed in this Supabase refactor.
  redirect('/admin/dashboard');
}