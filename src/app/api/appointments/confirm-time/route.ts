import { NextRequest, NextResponse } from 'next/server';
import { getBackendURL } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const token = request.cookies.get('token')?.value || '';
    const adminToken = request.cookies.get('adminToken')?.value || '';

    // 使用适当的授权令牌
    const authToken = adminToken || token;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: '未授权，请登录' },
        { status: 401 }
      );
    }

    // 构建后端API URL
    const backendURL = `${getBackendURL()}/appointments/confirm-time`;
    
    // 转发请求到后端
    const response = await fetch(backendURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data),
    });

    // 获取后端响应
    const responseData = await response.json();
    
    // 返回给前端
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('确认预约时间请求失败:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 