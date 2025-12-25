import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
  // Legacy route: Supabase reset flow lands on /user/update-password after /auth/callback.
  redirect('/user/update-password');
}