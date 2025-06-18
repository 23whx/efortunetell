import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '@/config/api';

// 后端API基础URL配置
// 使用配置文件中的API_BASE_URL，已更新为生产环境地址
const BACKEND_API_URL = `${API_BASE_URL}/api`;

// 最大文件大小1MB
const MAX_FILE_SIZE = 1024 * 1024;

export async function POST(request: NextRequest) {
  console.log('【DEBUG】开始处理前端批量上传图片请求');
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const originalUrls = formData.getAll('urls') as string[];
    
    console.log('【DEBUG】接收到的文件数量:', files.length);
    console.log('【DEBUG】原始URL数量:', originalUrls.length);
    
    if (!files || files.length === 0) {
      console.error('【DEBUG】批量上传失败: 未找到图片');
      return NextResponse.json({ success: false, message: '未找到图片' }, { status: 400 });
    }
    
    // 验证文件大小和类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validationErrors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`【DEBUG】检查文件 ${i+1}/${files.length}: ${file.name}, ${file.size} 字节, ${file.type}`);
      
      if (file.size > MAX_FILE_SIZE) {
        const error = `文件 ${file.name} 超过大小限制(${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB)`;
        console.error(`【DEBUG】${error}`);
        validationErrors.push(error);
      }
      
      if (!validTypes.includes(file.type)) {
        const error = `文件 ${file.name} 格式不支持，请上传JPG、PNG、GIF或WEBP格式的图片`;
        console.error(`【DEBUG】${error}`);
        validationErrors.push(error);
      }
    }
    
    if (validationErrors.length > 0) {
      console.error('【DEBUG】批量上传验证失败:', validationErrors.join('; '));
      return NextResponse.json({ 
        success: false, 
        message: validationErrors.join('; ')
      }, { status: 400 });
    }
    
    // 准备发送到后端的数据
    const backendFormData = new FormData();
    const fileNameMap = new Map<string, string>();
    
    // 添加每个文件到FormData，并记录文件名映射
    files.forEach((file, index) => {
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${extension}`;
      backendFormData.append('images', file, fileName);
      
      // 记录原始URL和新文件名的映射
      const originalUrl = index < originalUrls.length ? originalUrls[index] : '';
      if (originalUrl) {
        fileNameMap.set(originalUrl, fileName);
        console.log(`【DEBUG】映射文件名: ${originalUrl} -> ${fileName}`);
      }
    });
    
    // 将映射信息添加到FormData
    const urlMapJson = JSON.stringify(Array.from(fileNameMap.entries()));
    backendFormData.append('urlMap', urlMapJson);
    console.log(`【DEBUG】urlMap添加到请求:`, urlMapJson);
    
    // 添加认证头，从请求中获取并传递
    const authHeader = request.headers.get('Authorization') || '';
    console.log('【DEBUG】认证头:', authHeader ? '已设置' : '未设置');
    
    // 构建上传URL
    const uploadUrl = `${BACKEND_API_URL}/upload/images`;
    console.log('【DEBUG】上传地址:', uploadUrl);
    
    // 发送到后端API
    console.log('【DEBUG】开始发送请求到后端API');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: backendFormData,
      headers: authHeader ? { 'Authorization': authHeader } : {}
    });
    
    console.log('【DEBUG】后端响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = '';
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
        console.error('【DEBUG】后端响应错误详情:', errorMessage);
      } catch {
        console.error('解析后端错误响应失败');
        
        try {
          const responseText = await response.text();
          console.error('后端响应内容:', responseText);
        } catch {
          console.error('无法读取后端响应内容');
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        message: errorMessage || `上传到后端服务器失败: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('【DEBUG】后端响应成功:', JSON.stringify(data).substring(0, 200) + '...');
    
    // 准备返回数据，包括原始URL到新URL的映射
    const resultData = data.data.map((item: { path: string }, index: number) => {
      const originalUrl = index < originalUrls.length ? originalUrls[index] : '';
      const result = {
        originalUrl,
        uploadedUrl: item.path
      };
      console.log(`【DEBUG】处理结果项 ${index+1}:`, result);
      return result;
    });
    
    // 返回成功响应
    console.log('【DEBUG】批量上传完成，返回映射结果');
    return NextResponse.json({
      success: true,
      data: resultData
    });
    
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 