import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    // 获取搜索查询参数
    const searchQuery = request.nextUrl.searchParams.get('q');
    
    if (!searchQuery || searchQuery.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: '搜索关键词不能为空',
        data: [] 
      });
    }
    
    // 请求后端API进行搜索，使用文章列表API的搜索功能
    const response = await fetch(`${API_BASE_URL}/api/articles?search=${encodeURIComponent(searchQuery)}&limit=50`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: '搜索失败: ' + response.statusText,
        data: [] 
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // 返回搜索结果
    return NextResponse.json(data);
  } catch (error) {
    console.error('搜索处理错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '搜索处理出错',
      data: [] 
    }, { status: 500 });
  }
} 