import { redirect } from 'next/navigation';

export default function AdminLoginPage() {
  // Single auth system: use /user/login, admin access is determined by profiles.role='admin'
  redirect('/user/login');
}