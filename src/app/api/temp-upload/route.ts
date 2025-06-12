import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  console.log('📁 ===== 前端临时图片上传API =====');
  
  try {
    const formData = await request.formData();
    console.log('  - 接收到FormData');
    
    const file = formData.get('image') as File;
    console.log('  - 文件对象:', file ? '存在' : '不存在');
    
    if (!file) {
      console.error('❌ 没有找到图片文件');
      return NextResponse.json(
        { success: false, message: '没有找到图片文件' },
        { status: 400 }
      );
    }
    
    console.log('📄 文件信息:');
    console.log('  - 文件名:', file.name);
    console.log('  - 文件大小:', file.size, 'bytes');
    console.log('  - 文件类型:', file.type);
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      console.error('❌ 文件类型不支持:', file.type);
      return NextResponse.json(
        { success: false, message: '只支持图片文件' },
        { status: 400 }
      );
    }
    
    // 创建临时图片目录
    const tempImagesDir = path.join(process.cwd(), 'public', 'temp-images');
    console.log('📂 临时目录路径:', tempImagesDir);
    
    if (!existsSync(tempImagesDir)) {
      console.log('  - 目录不存在，正在创建...');
      await mkdir(tempImagesDir, { recursive: true });
      console.log('  - 目录创建成功');
    } else {
      console.log('  - 目录已存在');
    }
    
    // 生成唯一文件名
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(tempImagesDir, fileName);
    
    console.log('🏷️ 文件命名:');
    console.log('  - 原文件名:', file.name);
    console.log('  - 扩展名:', fileExt);
    console.log('  - 新文件名:', fileName);
    console.log('  - 完整路径:', filePath);
    
    // 保存文件
    console.log('💾 开始保存文件...');
    const bytes = await file.arrayBuffer();
    console.log('  - 读取文件数据:', bytes.byteLength, 'bytes');
    
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('  - 文件写入完成');
    
    const responseData = {
      success: true,
      data: {
        url: `/temp-images/${fileName}`,
        fileName: fileName,
        filePath: filePath
      }
    };
    
    console.log('✅ 临时图片保存成功');
    console.log('  - 访问URL:', responseData.data.url);
    console.log('🏁 前端临时上传API结束');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 ===== 前端临时上传API出错 =====');
    console.error('错误详情:', error);
    console.error('错误堆栈:', (error as Error).stack);
    
    return NextResponse.json(
      { success: false, message: '图片上传失败' },
      { status: 500 }
    );
  }
} 