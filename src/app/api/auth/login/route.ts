import { NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    console.log('登录请求拦截器');
    const data = await request.json();
    console.log('接收到的登录数据:', data);
    
    // 确保用户名参数正确
    const requestData = {
      username: data.username,
      password: data.password
    };
    
    console.log('发送到后端的登录数据:', requestData);
    
    // 添加更多日志
    console.log('请求URL:', API_ROUTES.LOGIN);
    
    // 转发请求到后端
    const response = await fetch(API_ROUTES.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    console.log('后端返回数据:', responseData);
    console.log('响应状态:', response.status);
    
    // 返回响应
    return NextResponse.json(responseData, {
      status: response.status
    });
  } catch (error) {
    console.error('登录代理出错:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
} 