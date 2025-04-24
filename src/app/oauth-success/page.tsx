'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('未收到有效的认证令牌');
      setIsLoading(false);
      return;
    }

    // 存储令牌到localStorage
    localStorage.setItem('user', JSON.stringify({
      token: token
    }));

    // 获取用户信息并更新localStorage
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          if (userData.data && userData.data.user) {
            // 更新localStorage中的用户信息
            localStorage.setItem('user', JSON.stringify({
              username: userData.data.user.username,
              token: token
            }));
            
            // 如果是管理员，则同时更新admin存储
            if (userData.data.user.role === 'admin') {
              localStorage.setItem('admin', JSON.stringify({
                username: userData.data.user.username,
                token: token
              }));
              router.push('/admin/dashboard');
              return;
            }
          }
          
          // 普通用户跳转到用户资料页
          router.push('/user/profile');
        } else {
          throw new Error('获取用户信息失败');
        }
      } catch (err) {
        console.error('获取用户数据错误:', err);
        // 即使获取用户数据失败，仍然跳转到用户资料页
        router.push('/user/profile');
      }
    };

    fetchUserData();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFACD]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#FF6F61] text-center">
        {isLoading ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-[#FF6F61]">登录成功</h1>
            <p className="mb-4">正在获取您的信息，即将跳转...</p>
            <div className="w-10 h-10 border-4 border-[#FF6F61] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-[#FF6F61]">登录失败</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/user/login')} 
              className="px-4 py-2 bg-[#FF6F61] text-white rounded hover:bg-[#ff8a75]"
            >
              返回登录页
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
} 