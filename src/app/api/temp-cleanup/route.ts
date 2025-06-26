import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: NextRequest) {
  console.log('🧹 ===== 临时图片清理API =====');
  
  try {
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
    
    if (!existsSync(tempImagesDir)) {
      console.log('  - 临时目录不存在，无需清理');
      return NextResponse.json({
        success: true,
        message: '临时目录不存在，无需清理',
        deletedCount: 0
      });
    }
    
    // 读取请求体，获取要删除的特定文件列表
    let specificFiles: string[] = [];
    try {
      const body = await request.json();
      specificFiles = body.filesToDelete || [];
      console.log('  - 指定删除的文件:', specificFiles);
    } catch {
      console.log('  - 未指定特定文件，将使用安全清理模式');
    }

    // 读取目录中的所有文件
    console.log('📂 读取临时目录内容...');
    const files = await readdir(tempImagesDir);
    console.log(`  - 找到 ${files.length} 个文件:`, files);
    
    if (files.length === 0) {
      console.log('  - 目录为空，无需清理');
      return NextResponse.json({
        success: true,
        message: '临时目录为空，无需清理',
        deletedCount: 0
      });
    }
    
    let filesToDelete: string[] = [];
    
    if (specificFiles.length > 0) {
      // 模式1：只删除指定的文件
      console.log('🎯 精确删除模式：只删除指定的文件');
      filesToDelete = files.filter(file => specificFiles.includes(file));
      console.log(`  - 匹配到 ${filesToDelete.length} 个待删除文件:`, filesToDelete);
    } else {
      // 模式2：安全清理模式 - 只删除超过1小时的旧文件
      console.log('🕒 安全清理模式：只删除超过1小时的旧文件');
      const ONE_HOUR = 60 * 60 * 1000; // 1小时的毫秒数
      const now = Date.now();
      
      for (const fileName of files) {
        try {
          const filePath = path.join(tempImagesDir, fileName);
          const fileStats = await stat(filePath);
          const fileAge = now - fileStats.mtime.getTime();
          
          if (fileAge > ONE_HOUR) {
            filesToDelete.push(fileName);
            console.log(`  - 旧文件 ${fileName}: ${Math.round(fileAge / 1000 / 60)} 分钟前创建`);
          } else {
            console.log(`  - 新文件 ${fileName}: ${Math.round(fileAge / 1000 / 60)} 分钟前创建，保留`);
          }
        } catch {
          console.error(`  - 检查文件 ${fileName} 失败`);
        }
      }
      
      console.log(`  - 找到 ${filesToDelete.length} 个超过1小时的旧文件`);
    }
    
    if (filesToDelete.length === 0) {
      console.log('✅ 没有文件需要删除');
      return NextResponse.json({
        success: true,
        message: '没有文件需要删除',
        deletedCount: 0
      });
    }

    // 删除文件
    console.log('🗑️ 开始删除文件...');
    let deletedCount = 0;
    const failedDeletions: string[] = [];
    
    const deletePromises = filesToDelete.map(async (fileName) => {
      try {
        const filePath = path.join(tempImagesDir, fileName);
        console.log(`  - 删除文件: ${fileName}`);
        await unlink(filePath);
        deletedCount++;
        console.log(`    ✅ 已删除: ${fileName}`);
      } catch (error) {
        console.error(`    ❌ 删除失败: ${fileName}`, error);
        failedDeletions.push(fileName);
      }
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ 清理完成，共删除 ${deletedCount} 个文件`);
    if (failedDeletions.length > 0) {
      console.log(`⚠️ ${failedDeletions.length} 个文件删除失败:`, failedDeletions);
    }
    console.log('🏁 临时图片清理API结束');
    
    return NextResponse.json({
      success: true,
      message: `成功清理 ${deletedCount} 个临时文件${failedDeletions.length > 0 ? `，${failedDeletions.length} 个文件删除失败` : ''}`,
      deletedCount: deletedCount,
      failedDeletions: failedDeletions
    });
    
  } catch (error) {
    console.error('💥 ===== 临时图片清理API出错 =====');
    console.error('错误详情:', error);
    return NextResponse.json({ 
      success: false, 
      message: `清理失败: ${(error as Error)?.message || '未知错误'}` 
    }, { status: 500 });
  }
} 