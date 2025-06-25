import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { existsSync, constants } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

export async function POST(request: NextRequest) {
  console.log('📁 ===== 前端临时图片上传API =====');
  
  // 环境检测
  console.log('🔍 环境信息:');
  console.log('  - Node.js版本:', process.version);
  console.log('  - 平台:', process.platform);
  console.log('  - 架构:', process.arch);
  console.log('  - 当前工作目录:', process.cwd());
  console.log('  - 操作系统:', os.type(), os.release());
  console.log('  - 临时目录:', os.tmpdir());
  console.log('  - 环境变量 VERCEL:', process.env.VERCEL || '未设置');
  console.log('  - 环境变量 NODE_ENV:', process.env.NODE_ENV || '未设置');
  
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

    // 检测是否在Vercel环境
    const isVercel = process.env.VERCEL === '1';
    console.log('🌐 部署环境检测:', isVercel ? 'Vercel无服务器环境' : '本地或其他环境');

    let tempImagesDir: string;
    let useSystemTemp = false;

    if (isVercel) {
      // Vercel环境：使用系统临时目录
      console.log('⚠️ 检测到Vercel环境，使用系统临时目录');
      tempImagesDir = path.join(os.tmpdir(), 'temp-images');
      useSystemTemp = true;
    } else {
      // 本地环境：使用public目录
      console.log('🏠 本地环境，使用public目录');
      tempImagesDir = path.join(process.cwd(), 'public', 'temp-images');
    }
    
    console.log('📂 临时目录路径:', tempImagesDir);

    // 检查目录访问权限
    try {
      if (existsSync(tempImagesDir)) {
        console.log('  - 目录已存在，检查权限...');
        await access(tempImagesDir, constants.R_OK | constants.W_OK);
        console.log('  - 目录读写权限正常');
      } else {
        console.log('  - 目录不存在，正在创建...');
        await mkdir(tempImagesDir, { recursive: true });
        console.log('  - 目录创建成功');
        
        // 验证创建的目录
        await access(tempImagesDir, constants.R_OK | constants.W_OK);
        console.log('  - 新创建目录权限验证通过');
      }
    } catch (accessError) {
      console.error('❌ 目录访问权限错误:', accessError);
      throw new Error(`目录权限错误: ${accessError}`);
    }
    
    // 生成唯一文件名
    const fileExt = path.extname(file.name) || '.png';
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(tempImagesDir, fileName);
    
    console.log('🏷️ 文件命名:');
    console.log('  - 原文件名:', file.name);
    console.log('  - 扩展名:', fileExt);
    console.log('  - 新文件名:', fileName);
    console.log('  - 完整路径:', filePath);
    
    // 保存文件
    console.log('💾 开始保存文件...');
    
    try {
      const bytes = await file.arrayBuffer();
      console.log('  - 读取文件数据成功:', bytes.byteLength, 'bytes');
      
      const buffer = Buffer.from(bytes);
      console.log('  - 创建Buffer成功:', buffer.length, 'bytes');
      
      console.log('  - 开始写入文件到:', filePath);
      await writeFile(filePath, buffer);
      console.log('  - 文件写入完成');
      
      // 验证文件是否真的被写入
      if (existsSync(filePath)) {
        console.log('  - ✅ 文件写入验证成功');
      } else {
        console.error('  - ❌ 文件写入验证失败：文件不存在');
        throw new Error('文件写入验证失败');
      }
      
    } catch (writeError) {
      console.error('❌ 文件写入错误:', writeError);
      console.error('写入错误详情:', {
        code: (writeError as any).code,
        errno: (writeError as any).errno,
        path: (writeError as any).path,
        syscall: (writeError as any).syscall
      });
      throw new Error(`文件写入失败: ${writeError}`);
    }
    
    // 构建响应URL
    let responseUrl: string;
    if (useSystemTemp) {
      // Vercel环境：返回一个临时标识，后续需要特殊处理
      responseUrl = `/temp-images/${fileName}`;
      console.log('⚠️ Vercel环境：返回临时URL标识');
    } else {
      // 本地环境：返回public路径
      responseUrl = `/temp-images/${fileName}`;
    }

    const responseData = {
      success: true,
      data: {
        url: responseUrl,
        fileName: fileName,
        filePath: filePath,
        environment: isVercel ? 'vercel' : 'local',
        useSystemTemp: useSystemTemp
      }
    };
    
    console.log('✅ 临时图片保存成功');
    console.log('  - 访问URL:', responseData.data.url);
    console.log('  - 环境:', responseData.data.environment);
    console.log('  - 系统临时目录:', responseData.data.useSystemTemp);
    console.log('🏁 前端临时上传API结束');
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 ===== 前端临时上传API出错 =====');
    console.error('错误类型:', error?.constructor?.name);
    console.error('错误消息:', (error as Error)?.message);
    console.error('错误代码:', (error as any)?.code);
    console.error('错误详情:', error);
    console.error('错误堆栈:', (error as Error)?.stack);
    
    // 返回更详细的错误信息
    return NextResponse.json(
      { 
        success: false, 
        message: `图片上传失败: ${(error as Error)?.message || '未知错误'}`,
        error: {
          type: error?.constructor?.name,
          message: (error as Error)?.message,
          code: (error as any)?.code,
          stack: (error as Error)?.stack
        },
        environment: {
          isVercel: process.env.VERCEL === '1',
          nodeVersion: process.version,
          platform: process.platform,
          cwd: process.cwd(),
          tmpdir: os.tmpdir()
        }
      },
      { status: 500 }
    );
  }
} 