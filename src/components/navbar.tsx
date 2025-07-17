'use client';

import { Search, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useState, useEffect, FormEvent } from 'react';
import { API_ROUTES, getAuthHeaders } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvatarPath } from '@/utils/avatar';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [admin, setAdmin] = useState<{ username: string } | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // 同步用户和管理员登录状态
  useEffect(() => {
    const syncUserAndAdmin = () => {
      // 普通用户登录状态
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      
      // 管理员登录状态
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      } else {
        setAdmin(null);
      }
    };
    
    syncUserAndAdmin();
    window.addEventListener('storage', syncUserAndAdmin);
    return () => window.removeEventListener('storage', syncUserAndAdmin);
  }, [pathname]);

  // 处理搜索
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // 普通用户退出登录
  const handleUserLogout = async () => {
    try {
      // 调用后端退出登录接口
      await fetch(API_ROUTES.LOGOUT, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('退出登录失败', error);
    } finally {
      // 无论接口是否成功，前端都清除登录状态
      localStorage.removeItem('user');
      setUser(null);
      if (pathname.startsWith('/user/')) {
        window.location.href = '/blog';
      } else {
        window.location.reload();
      }
    }
  };

  // 管理员退出登录
  const handleAdminLogout = async () => {
    try {
      // 调用后端退出登录接口
      await fetch(API_ROUTES.LOGOUT, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('管理员退出登录失败', error);
    } finally {
      // 无论接口是否成功，前端都清除登录状态
      localStorage.removeItem('admin');
      setAdmin(null);
      window.location.href = '/blog';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 pt-6 pb-4 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="Rolley Divination Blog Icon"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-gray-900 font-sans tracking-widest">{t('common.siteTitle')}</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* 导航链接，不是管理员时显示 */}
          {!admin && (
            <>
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/' || pathname === '/blog' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.blog')}
              </Link>
              <Link 
                href="/fortune" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/fortune' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.fortune')}
              </Link>
              <Link 
                href="/fortune/bazi-persona" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname.startsWith('/fortune/bazi-persona') ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.baziTest')}
              </Link>
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder={t('common.search') + '...'}
                  className="bg-gray-100 text-gray-900 px-4 py-2 pl-10 rounded-lg w-64 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button type="submit" className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
          
          {/* 管理员登录后显示管理员专有链接 */}
          {admin && (
            <>
              <Link 
                href="/admin/dashboard" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('common.dashboard')}
              </Link>
            </>
          )}
          
          {/* 语言切换器 */}
          <LanguageSwitcher />
          
          {/* 登录状态显示区域 */}
          {admin ? (
            // 管理员登录后显示
            <div className="flex items-center gap-2">
              <Button 
                className="bg-[#FF6F61] text-white hover:bg-[#ff8a75] font-sans border-[#FF6F61] border flex items-center gap-1"
                onClick={handleAdminLogout}
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </Button>
              <Link href="/admin/dashboard" className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FF6F61] hover:opacity-80" title={t('nav.admin')}>
                <Image
                  src={getAvatarPath(admin)}
                  alt="Admin Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </Link>
            </div>
          ) : user ? (
            // 普通用户登录后显示
            <div className="flex items-center gap-2">
              <Button 
                className="bg-black text-white hover:bg-gray-800 font-sans border-black border" 
                onClick={handleUserLogout}
              >
                {t('common.logout')}
              </Button>
              <Link href="/user/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-black hover:opacity-80" title={t('nav.profile')}>
                <Image
                  src={getAvatarPath(user)}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              </Link>
            </div>
          ) : (
            // 未登录状态显示
            <>
              <Link href="/user/login">
                <Button className="bg-black text-white hover:bg-gray-800 font-sans border-black border">{t('nav.login')}</Button>
              </Link>
              <Link href="/user/register">
                <Button className="bg-black text-white hover:bg-gray-800 font-sans border-black border">{t('common.register')}</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* 移动端导航菜单按钮 */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <Button className="text-gray-900 hover:bg-gray-100">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}