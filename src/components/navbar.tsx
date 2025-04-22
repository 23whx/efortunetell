'use client';

import { Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
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
          {/* 登录/注册或头像 */}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Button className="bg-black text-white hover:bg-gray-800 font-sans border-black border" onClick={handleLogout}>注销</Button>
                <a href="/user/profile" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg cursor-pointer select-none hover:opacity-80" title="个人中心">
                  {user.username.charAt(0)}
                </a>
              </div>
            </>
          ) : (
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
        
        <div className="md:hidden flex items-center gap-2">
          <Button className="text-gray-900 hover:bg-gray-100">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}