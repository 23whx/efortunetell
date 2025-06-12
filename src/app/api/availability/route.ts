import { NextRequest, NextResponse } from 'next/server';
import { getBackendURL } from '@/config/api';

// 获取日期可用性
export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    
    // 获取管理员或用户令牌
    const token = request.cookies.get('token')?.value || '';
    const adminToken = request.cookies.get('adminToken')?.value || '';
    const authToken = adminToken || token;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: '未授权，请登录' },
        { status: 401 }
      );
    }
    
    // 从后端API获取可用时间段
    const url = `${getBackendURL()}/availability${date ? `?date=${date}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      cache: 'no-store' // 禁用缓存，确保获取最新数据
    });
    
    if (!response.ok) {
      throw new Error(`获取可用性失败: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取日期可用性失败:', error);
    return NextResponse.json(
      { success: false, message: '获取可用性数据失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 更新日期可用性（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, isAvailable } = body;
    
    if (!date) {
      return NextResponse.json(
        { success: false, message: '日期参数必须提供' },
        { status: 400 }
      );
    }
    
    // 获取令牌
    const token = request.cookies.get('token')?.value || '';
    const adminToken = request.cookies.get('adminToken')?.value || '';
    const authToken = adminToken || token;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: '未授权，请登录' },
        { status: 401 }
      );
    }
    
    // 向后端API发送更新请求
    const response = await fetch(`${getBackendURL()}/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ date, isAvailable })
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('更新日期可用性失败:', error);
    return NextResponse.json(
      { success: false, message: '更新可用性失败，请稍后再试' },
      { status: 500 }
    );
  }
} 