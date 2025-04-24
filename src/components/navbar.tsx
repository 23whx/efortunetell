'use client';

import { Search, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { API_ROUTES, getAuthHeaders } from '@/config/api';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [admin, setAdmin] = useState<{ username: string } | null>(null);

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
        window.location.href = '/';
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
      window.location.href = '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 pt-6 pb-4 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full" />
            <span className="text-xl font-bold text-gray-900 font-sans tracking-widest">易学</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* 导航链接，不是管理员时显示 */}
          {!admin && (
            <>
              <Link 
                href="/blog" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/blog' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                博客
              </Link>
              <Link 
                href="/fortune" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/fortune' ? 'bg-primary text-primary-foreground' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                玄学预测服务
              </Link>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索文章或服务..."
                  className="bg-gray-100 text-gray-900 px-4 py-2 pl-10 rounded-lg w-64 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
            </>
          )}
          
          {/* 管理员登录后显示管理员专有链接 */}
          {admin && (
            <>
              <Link 
                href="/admin/dashboard" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                管理面板
              </Link>
              <Link 
                href="/admin/users" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/admin/users' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                用户管理
              </Link>
              <Link 
                href="/admin/content" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname === '/admin/content' ? 'bg-[#FF6F61] text-white' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                内容管理
              </Link>
            </>
          )}
          
          {/* 登录状态显示区域 */}
          {admin ? (
            // 管理员登录后显示
            <div className="flex items-center gap-2">
              <Button 
                className="bg-[#FF6F61] text-white hover:bg-[#ff8a75] font-sans border-[#FF6F61] border flex items-center gap-1"
                onClick={handleAdminLogout}
              >
                <LogOut className="w-4 h-4" />
                管理员退出
              </Button>
              <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-[#FF6F61] flex items-center justify-center text-white font-bold text-lg cursor-pointer select-none hover:opacity-80" title="管理后台">
                {admin.username.charAt(0).toUpperCase()}
              </Link>
            </div>
          ) : user ? (
            // 普通用户登录后显示
            <div className="flex items-center gap-2">
              <Button 
                className="bg-black text-white hover:bg-gray-800 font-sans border-black border" 
                onClick={handleUserLogout}
              >
                退出登录
              </Button>
              <Link href="/user/profile" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg cursor-pointer select-none hover:opacity-80" title="个人中心">
                {user.username.charAt(0).toUpperCase()}
              </Link>
            </div>
          ) : (
            // 未登录状态显示
            <>
              <Link href="/user/login">
                <Button className="bg-black text-white hover:bg-gray-800 font-sans border-black border">登录</Button>
              </Link>
              <Link href="/user/register">
                <Button className="bg-black text-white hover:bg-gray-800 font-sans border-black border">注册</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* 移动端导航菜单按钮 */}
        <div className="md:hidden flex items-center gap-2">
          <Button className="text-gray-900 hover:bg-gray-100">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}