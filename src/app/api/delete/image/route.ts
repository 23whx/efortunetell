import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const data = await request.json();
    const { imagePath } = data;
    
    console.log('收到删除图片请求，路径:', imagePath);
    
    if (!imagePath) {
      return NextResponse.json(
        { success: false, message: '图片路径不能为空' },
        { status: 400 }
      );
    }
    
    // 提取文件名，无论路径格式如何
    let fileName = '';
    if (imagePath.startsWith('/images/')) {
      fileName = imagePath.split('/').pop() || '';
    } else if (imagePath.includes('\\images\\')) {
      fileName = imagePath.split('\\').pop() || '';
    } else if (imagePath.includes('/images/')) {
      fileName = imagePath.split('/').pop() || '';
    } else if (imagePath.includes('api.efortunetell.blog/images/')) {
      fileName = imagePath.split('/').pop() || '';
    }
    
    if (!fileName) {
      console.warn('无法从路径中提取文件名:', imagePath);
      return NextResponse.json(
        { success: false, message: '无法从路径中提取文件名' },
        { status: 400 }
      );
    }
    
    console.log('提取的文件名:', fileName);
    
    // 确保使用标准化路径
    const filePath = path.join(process.cwd(), 'public', 'images', fileName);
    
    console.log('物理文件路径:', filePath);
    console.log('process.cwd():', process.cwd());
    console.log('是否存在:', fs.existsSync(filePath));
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.warn('文件不存在:', filePath);
      return NextResponse.json(
        { 
          success: true, 
          message: '文件不存在，无需删除',
          details: {
            imagePath,
            fileName,
            filePath,
            exists: false
          }
        }
      );
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    console.log('成功删除图片:', filePath);
    
    return NextResponse.json({
      success: true,
      message: '图片已成功删除',
      details: {
        imagePath,
        fileName,
        filePath,
        exists: true,
        deleted: true
      }
    });
  } catch (error: unknown) {
    console.error('删除图片错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    // 尝试提取更多诊断信息
    let diagnostics = {};
    try {
      if (error instanceof Error) {
        diagnostics = {
          errorName: error.name,
          errorStack: error.stack,
        };
      }
    } catch (e) {
      console.error('生成诊断信息时出错:', e);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: `删除图片失败: ${errorMessage}`,
        diagnostics
      },
      { status: 500 }
    );
  }
} 