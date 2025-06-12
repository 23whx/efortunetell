import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function GET(request: NextRequest) {
  console.log('🖼️ ===== 图片代理API请求 =====');
  console.log('  - 请求URL:', request.url);
  
  try {
    // 获取图片路径参数
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');
    
    console.log('  - 提取的图片路径:', imageUrl);
    
    if (!imageUrl) {
      console.error('❌ 图片路径参数缺失');
      return new NextResponse('图片路径参数缺失', { status: 400 });
    }
    
    // 构建完整的后端图片URL
    let fullImageUrl = imageUrl;
    
    // 如果是相对路径，添加API基础URL
    if (!imageUrl.startsWith('http')) {
      fullImageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    console.log('  - API_BASE_URL:', API_BASE_URL);
    console.log('  - 构建的完整URL:', fullImageUrl);
    
    // 从后端API获取图片
    console.log('🌐 开始请求后端图片...');
    const response = await fetch(fullImageUrl, {
      cache: 'force-cache', // 使用缓存提高性能
      next: { revalidate: 3600 } // 每小时重新验证一次
    });
    
    console.log('  - 后端响应状态:', response.status);
    console.log('  - 后端响应头:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error(`❌ 获取图片失败: ${response.status} ${response.statusText}`);
      console.error('  - 失败的URL:', fullImageUrl);
      
      // 如果是404错误，尝试回退到默认图片
      if (response.status === 404) {
        console.log('  - 返回404错误信息');
        return new NextResponse(JSON.stringify({ 
          error: '图片未找到', 
          originalUrl: fullImageUrl 
        }), { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      return new NextResponse('获取图片失败', { status: response.status });
    }
    
    // 获取图片内容类型
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    console.log('  - 图片内容类型:', contentType);
    
    // 获取图片数据
    console.log('📥 读取图片数据...');
    const imageData = await response.arrayBuffer();
    console.log('  - 图片数据大小:', imageData.byteLength, 'bytes');
    
    // 返回图片响应
    const responseHeaders = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // 缓存24小时
      'X-Content-Type-Options': 'nosniff',
      'X-Original-Url': fullImageUrl
    };
    
    console.log('✅ 图片代理成功');
    console.log('  - 响应头:', responseHeaders);
    console.log('🏁 图片代理API结束');
    
    return new NextResponse(imageData, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('💥 ===== 图片代理API出错 =====');
    console.error('错误详情:', error);
    console.error('错误堆栈:', (error as Error).stack);
    return new NextResponse('图片代理服务错误', { status: 500 });
  }
} 