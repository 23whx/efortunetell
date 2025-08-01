'use client';

import { Search, User, LogOut, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // 关闭移动端菜单当路由变化时
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 处理搜索
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setIsMobileMenuOpen(false);
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
      setIsMobileMenuOpen(false);
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
      setIsMobileMenuOpen(false);
      window.location.href = '/blog';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 pt-4 md:pt-6 pb-3 md:pb-4 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.png"
                alt="Rolley Divination Blog Icon"
                width={28}
                height={28}
                className="md:w-8 md:h-8 rounded-full"
              />
              <span className="text-lg md:text-xl font-bold text-gray-900 font-sans tracking-widest">
                {t('common.siteTitle')}
              </span>
            </Link>
          </div>
          
          {/* 桌面端导航 */}
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
            <Button 
              className="text-gray-900 hover:bg-gray-100 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* 移动端全屏菜单覆盖层 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden pt-20">
          <div className="flex flex-col h-full">
            {/* 搜索栏 */}
            {!admin && (
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    placeholder={t('common.search') + '...'}
                    className="w-full bg-gray-100 text-gray-900 px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-sans text-lg"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <button type="submit" className="absolute left-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <Search className="w-6 h-6" />
                  </button>
                </form>
              </div>
            )}

            {/* 导航链接 */}
            <div className="flex-1 overflow-y-auto">
              {!admin ? (
                // 普通导航菜单
                <div className="space-y-1 p-4">
                  <Link 
                    href="/" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/' || pathname === '/blog' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {t('nav.blog')}
                  </Link>
                  <Link 
                    href="/fortune" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/fortune' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {t('nav.fortune')}
                  </Link>
                  <Link 
                    href="/fortune/bazi-persona" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname.startsWith('/fortune/bazi-persona') ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {t('nav.baziTest')}
                  </Link>
                  <Link 
                    href="/contact" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/contact' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {t('nav.contact')}
                  </Link>
                </div>
              ) : (
                // 管理员菜单
                <div className="space-y-1 p-4">
                  <Link 
                    href="/admin/dashboard" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {t('common.dashboard')}
                  </Link>
                  <Link 
                    href="/admin/write" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/admin/write' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    写文章
                  </Link>
                  <Link 
                    href="/admin/articles" 
                    className={`block px-4 py-4 rounded-lg font-medium text-lg transition-colors ${pathname === '/admin/articles' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    管理文章
                  </Link>
                </div>
              )}
            </div>

            {/* 底部区域：语言切换和用户信息 */}
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* 语言切换器 */}
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>

              {/* 用户信息和登录/注销按钮 */}
              {admin ? (
                // 管理员登录后显示
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={getAvatarPath(admin)}
                      alt="Admin Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#FF6F61]"
                      unoptimized={true}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{admin.username}</p>
                      <p className="text-sm text-gray-500">{t('nav.admin')}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#FF6F61] text-white hover:bg-[#ff8a75] font-sans border-[#FF6F61] border flex items-center justify-center gap-2 py-3 text-lg"
                    onClick={handleAdminLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    {t('common.logout')}
                  </Button>
                </div>
              ) : user ? (
                // 普通用户登录后显示
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={getAvatarPath(user)}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-black"
                      unoptimized={true}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{t('nav.user')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link href="/user/profile" className="block">
                      <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 font-sans border border-gray-300 py-3 text-lg">
                        {t('nav.profile')}
                      </Button>
                    </Link>
                    <Button 
                      className="w-full bg-black text-white hover:bg-gray-800 font-sans border-black border py-3 text-lg" 
                      onClick={handleUserLogout}
                    >
                      {t('common.logout')}
                    </Button>
                  </div>
                </div>
              ) : (
                // 未登录状态显示
                <div className="space-y-2">
                  <Link href="/user/login" className="block">
                    <Button className="w-full bg-black text-white hover:bg-gray-800 font-sans border-black border py-3 text-lg">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/user/register" className="block">
                    <Button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 font-sans border border-gray-300 py-3 text-lg">
                      {t('common.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}