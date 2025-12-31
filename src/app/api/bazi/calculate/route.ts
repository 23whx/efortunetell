/**
 * API: 计算八字
 * POST /api/bazi/calculate
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, formatBaZi, getElementsCount } from '@/lib/bazi/calendar';

export async function POST(request: NextRequest) {
  try {
    const { datetime } = await request.json();
    
    if (!datetime) {
      return NextResponse.json(
        { error: 'datetime is required (ISO 8601 format)' },
        { status: 400 }
      );
    }
    
    // 验证日期格式
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid datetime format' },
        { status: 400 }
      );
    }
    
    // 计算八字
    const bazi = calculateBaZi(date);
    const baziString = formatBaZi(bazi);
    const elementsCount = getElementsCount(bazi);
    
    return NextResponse.json({
      success: true,
      bazi: {
        ...bazi,
        formatted: baziString,
        elementsCount
      }
    });
    
  } catch (error) {
    console.error('Calculate BaZi error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate BaZi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datetime = searchParams.get('datetime');
    
    if (!datetime) {
      // 如果没有提供日期，返回当前时间的八字
      const now = new Date();
      const bazi = calculateBaZi(now);
      const baziString = formatBaZi(bazi);
      const elementsCount = getElementsCount(bazi);
      
      return NextResponse.json({
        success: true,
        bazi: {
          ...bazi,
          formatted: baziString,
          elementsCount
        }
      });
    }
    
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid datetime format' },
        { status: 400 }
      );
    }
    
    const bazi = calculateBaZi(date);
    const baziString = formatBaZi(bazi);
    const elementsCount = getElementsCount(bazi);
    
    return NextResponse.json({
      success: true,
      bazi: {
        ...bazi,
        formatted: baziString,
        elementsCount
      }
    });
    
  } catch (error) {
    console.error('Calculate BaZi error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate BaZi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

