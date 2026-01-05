'use client';

import { Search, User, LogOut, Menu, X, ChevronDown, Sparkles, LayoutGrid, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAvatarPath } from '@/utils/avatar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getProfileById } from '@/lib/supabase/profile';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const lastKnownAdminRef = useRef<boolean>(false);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);

  // Close explore dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync Supabase session + role
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    let cancelled = false;

    const refreshFromSession = async () => {
      // Prefer local session (no /auth/v1/user network call)
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user ?? null;

      if (!sessionUser) {
        if (cancelled) return;
        setUser(null);
        setRoleLoading(false);
        setIsAdmin(false);
        lastKnownAdminRef.current = false;
        return;
      }

      if (cancelled) return;
      setUser({ email: sessionUser.email || '' });

      // Role fetch can fail on flaky networks; don't immediately demote UI.
      setRoleLoading(true);
      try {
        const { role } = await getProfileById(supabase, sessionUser.id);
        if (cancelled) return;
        const admin = role === 'admin';
        setIsAdmin(admin);
        lastKnownAdminRef.current = admin;
      } catch {
        if (cancelled) return;
        setIsAdmin(lastKnownAdminRef.current);
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };
    
    refreshFromSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Session is provided here; avoid extra network calls.
      if (!session?.user) {
        setUser(null);
        setRoleLoading(false);
        setIsAdmin(false);
        lastKnownAdminRef.current = false;
        return;
      }
      setUser({ email: session.user.email || '' });
      setRoleLoading(true);
      getProfileById(supabase, session.user.id)
        .then(({ role }) => {
          const admin = role === 'admin';
          setIsAdmin(admin);
          lastKnownAdminRef.current = admin;
        })
        .catch(() => {
          setIsAdmin(lastKnownAdminRef.current);
        })
        .finally(() => setRoleLoading(false));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []); // 只在组件挂载时执行，认证状态变化通过 onAuthStateChange 监听

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

  // Logout
  const handleUserLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('退出登录失败', error);
    } finally {
      setIsMobileMenuOpen(false);
      if (pathname.startsWith('/user/')) {
        window.location.href = '/blog';
      } else {
        window.location.reload();
      }
    }
  };

  const handleAdminLogout = handleUserLogout;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-gray-100 z-50 py-3 md:py-4 px-4 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 group">
            <Link href="/" className="flex items-center gap-2 transition-transform active:scale-95">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <Image
                  src="/icon.png"
                  alt="Rolley Divination Blog Icon"
                  fill
                  className="rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                />
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900 font-sans tracking-[0.15em] uppercase whitespace-nowrap">
                {t('common.siteTitle')}
              </span>
            </Link>
          </div>
          
          {/* 桌面端导航 */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 flex-nowrap">
            <>
              <div className="flex items-center bg-gray-50/50 p-1 rounded-2xl border border-gray-100 flex-nowrap">
                <Link 
                  href="/" 
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${pathname === '/' || pathname === '/blog' ? 'bg-white shadow-sm text-[#FF6F61]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {t('nav.blog')}
                </Link>

                <div className="relative" ref={exploreDropdownRef}>
                  <button
                    onClick={() => setIsExploreOpen(!isExploreOpen)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-1 ${pathname.startsWith('/services') || pathname === '/ai-chat' || pathname === '/fortune' ? 'bg-white shadow-sm text-[#FF6F61]' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {t('nav.explore')}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isExploreOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                      <Link
                        href="/services"
                        onClick={() => setIsExploreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname.startsWith('/services') ? 'text-[#FF6F61] bg-[#FF6F61]/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        {t('nav.services')}
                      </Link>
                      <Link
                        href="/ai-chat"
                        onClick={() => setIsExploreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === '/ai-chat' ? 'text-[#FF6F61] bg-[#FF6F61]/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('nav.aiChat')}
                      </Link>
                      <Link
                        href="/fortune"
                        onClick={() => setIsExploreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === '/fortune' ? 'text-[#FF6F61] bg-[#FF6F61]/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {t('nav.fortune')}
                      </Link>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <Link 
                    href="/admin/dashboard" 
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${pathname.startsWith('/admin') ? 'bg-white shadow-sm text-[#FF6F61]' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {t('common.dashboard')}
                  </Link>
                )}
              </div>

              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#FF6F61] transition-colors" />
                </div>
                <input 
                  type="text" 
                    placeholder={t('common.search')}
                    className="bg-gray-50/80 text-gray-900 text-sm pl-10 pr-4 py-2.5 rounded-xl w-32 lg:w-48 focus:w-64 border border-transparent focus:border-[#FF6F61]/20 focus:bg-white focus:shadow-lg focus:shadow-[#FF6F61]/5 outline-none transition-all duration-500 font-sans"
                    value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </form>
            </>
            
            <div className="h-6 w-[1px] bg-gray-200 mx-2" />
            
            <LanguageSwitcher />
            
            {/* 登录状态显示区域 */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {isAdmin ? (
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <button 
                    onClick={handleAdminLogout}
                    className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="whitespace-nowrap">{t('common.logout')}</span>
                  </button>
                  <Link href="/admin/dashboard" className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF6F61] to-[#ffb347] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <Image
                        src={getAvatarPath({ username: user?.email || 'admin', role: 'admin' })}
                        alt="Admin"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </Link>
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  {roleLoading && (
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {t('common.syncing') || 'Syncing...'}
                    </span>
                  )}
                  <button 
                    onClick={handleUserLogout}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {t('common.logout')}
                  </button>
                  <Link href="/user/profile" className="relative group">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                      <Image
                        src={getAvatarPath({ username: user.email || 'user' })}
                        alt="User"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/user/login">
                    <Button variant="default" size="sm" className="bg-transparent border-none hover:bg-gray-100 shadow-none">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/user/register">
                    <Button size="sm">
                      {t('common.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-900 active:scale-90 transition-transform"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 md:hidden pt-24 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col h-full px-6">
            {!isAdmin && (
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={t('common.search')}
                    className="w-full bg-gray-100/50 text-gray-900 px-12 py-4 rounded-2xl border border-gray-100 focus:bg-white focus:shadow-lg focus:border-[#FF6F61]/20 outline-none transition-all text-lg"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </form>
            )}

            <div className="flex flex-col gap-2">
              <Link 
                href="/" 
                className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all whitespace-nowrap ${pathname === '/' || pathname === '/blog' ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.blog')}
              </Link>
              <Link
                href="/services"
                className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all whitespace-nowrap ${pathname.startsWith('/services') ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.services')}
              </Link>
              <Link
                href="/ai-chat"
                className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all whitespace-nowrap ${pathname === '/ai-chat' ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.aiChat')}
              </Link>
              <Link 
                href="/fortune" 
                className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all whitespace-nowrap ${pathname === '/fortune' ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                {t('nav.fortune')}
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin/dashboard" 
                  className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all whitespace-nowrap ${pathname.startsWith('/admin') ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  {t('common.dashboard')}
                </Link>
              )}
            </div>

            <div className="mt-auto mb-12 space-y-6">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              
              {user ? (
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <Image
                        src={getAvatarPath({ username: user.email || 'user', role: isAdmin ? 'admin' : 'user' })}
                        alt="Profile"
                        width={56}
                        height={56}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-500 uppercase tracking-tighter font-semibold">{isAdmin ? t('nav.admin') : t('nav.user')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={isAdmin ? "/admin/dashboard" : "/user/profile"} className="w-full">
                      <Button variant="default" className="w-full py-4 rounded-2xl">
                        {isAdmin ? t('common.dashboard') : t('nav.profile')}
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive"
                      className="w-full py-4 rounded-2xl" 
                      onClick={handleUserLogout}
                    >
                      {t('common.logout')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/user/login" className="w-full">
                    <Button variant="default" className="w-full py-4 rounded-2xl text-lg">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/user/register" className="w-full">
                    <Button className="w-full py-4 rounded-2xl text-lg">
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