import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

// 防止重复请求的时间戳缓存
let lastSuccessTimestamp = 0;
let lastFailureTimestamp = 0;
let consecutiveFailures = 0;
const CACHE_DURATION = 10000; // 10秒缓存
const FAILURE_CACHE_DURATION = 30000; // 失败后30秒缓存
const MAX_CONSECUTIVE_FAILURES = 3; // 连续失败3次后进入更长的缓存

export async function GET() {
  try {
    const now = Date.now();
    
    // 检查是否有成功缓存结果可用
    if (now - lastSuccessTimestamp < CACHE_DURATION) {
      console.log('【Debug】返回缓存的成功响应');
      return NextResponse.json({
        success: true,
        message: 'pong (cached)',
        timestamp: new Date().toISOString(),
        source: 'frontend-cache'
      });
    }
    
    // 检查是否在失败冷却期内
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && 
        now - lastFailureTimestamp < FAILURE_CACHE_DURATION) {
      console.log(`【Debug】连续失败${consecutiveFailures}次，在冷却期内，返回缓存的失败响应`);
      return NextResponse.json({
        success: false, 
        message: '后端服务器连接失败 (cached)',
        timestamp: new Date().toISOString(),
        source: 'frontend-failure-cache'
      }, { status: 200 });
    }
    
    console.log('【Debug】开始检查服务器连接');
    
    // 尝试连接后端的ping接口
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5秒超时
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`服务器连接失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 更新缓存时间戳和成功状态
      lastSuccessTimestamp = now;
      consecutiveFailures = 0;
      
      return NextResponse.json({
        success: true,
        message: data.message || 'pong',
        timestamp: data.timestamp || new Date().toISOString(),
        source: 'backend'
      });
    } catch {
      clearTimeout(timeoutId);
      
      // 更新失败状态
      lastFailureTimestamp = Date.now();
      consecutiveFailures++;
    }
  } catch (error: unknown) {
    console.error('Ping route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// HEAD请求也支持，用于轻量级检查
export async function HEAD() {
  try {
    const now = Date.now();
    
    // 检查是否有成功缓存结果可用
    if (now - lastSuccessTimestamp < CACHE_DURATION) {
      return new NextResponse(null, { status: 200 });
    }
    
    // 检查是否在失败冷却期内
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES && 
        now - lastFailureTimestamp < FAILURE_CACHE_DURATION) {
      return new NextResponse(null, { status: 200 });
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1秒超时
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ping`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // 更新缓存时间戳和成功状态
        lastSuccessTimestamp = now;
        consecutiveFailures = 0;
      } else {
        throw new Error(`服务器响应异常: ${response.status}`);
      }
    } catch {
      // 即使出错也返回成功，这样客户端不会因为连接检查而中断操作
      return new NextResponse(null, { status: 200 });
    }
    
    // 不管成功或失败都返回200
    return new NextResponse(null, { status: 200 });
  } catch {
    // 即使出错也返回成功，这样客户端不会因为连接检查而中断操作
    return new NextResponse(null, { status: 200 });
  }
} 