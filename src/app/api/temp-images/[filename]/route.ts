import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  console.log('🖼️ ===== 临时图片访问API =====');
  
  try {
    const filename = params.filename;
    console.log('  - 请求的文件名:', filename);
    
    if (!filename) {
      console.error('❌ 文件名为空');
      return NextResponse.json(
        { success: false, message: '文件名不能为空' },
        { status: 400 }
      );
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('❌ 文件名包含非法字符:', filename);
      return NextResponse.json(
        { success: false, message: '文件名包含非法字符' },
        { status: 400 }
      );
    }

    // 检测环境并确定临时目录
    const isVercel = process.env.VERCEL === '1';
    let tempImagesDir: string;

    if (isVercel) {
      tempImagesDir = path.join(os.tmpdir(), 'temp-images');
      console.log('  - Vercel环境，使用系统临时目录:', tempImagesDir);
    } else {
      tempImagesDir = path.join(process.cwd(), 'public', 'temp-images');
      console.log('  - 本地环境，使用public目录:', tempImagesDir);
    }

    const filePath = path.join(tempImagesDir, filename);
    console.log('  - 完整文件路径:', filePath);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.error('❌ 文件不存在:', filePath);
      return NextResponse.json(
        { success: false, message: '文件不存在' },
        { status: 404 }
      );
    }

    console.log('  - 文件存在，开始读取...');

    // 读取文件
    const fileBuffer = await readFile(filePath);
    console.log('  - 文件读取成功，大小:', fileBuffer.length, 'bytes');

    // 根据文件扩展名确定Content-Type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg'; // 默认

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.jpg':
      case '.jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }

    console.log('  - Content-Type:', contentType);
    console.log('✅ 临时图片返回成功');

    // 返回图片文件
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    });

  } catch (error) {
    console.error('💥 ===== 临时图片访问API出错 =====');
    console.error('错误详情:', error);
    console.error('错误堆栈:', (error as Error)?.stack);

    return NextResponse.json(
      { 
        success: false, 
        message: `读取图片失败: ${(error as Error)?.message || '未知错误'}`,
        error: {
          type: error?.constructor?.name,
          message: (error as Error)?.message,
          stack: (error as Error)?.stack
        }
      },
      { status: 500 }
    );
  }
} 