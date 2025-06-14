import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '@/config/api';

// 后端API基础URL修正
// 在配置文件中是 http://26.26.26.1:5000，确保在此处也一致
const BACKEND_API_URL = `${API_BASE_URL}/api`;

// 最大文件大小1MB
const MAX_FILE_SIZE = 1024 * 1024;

export async function POST(request: NextRequest) {
  console.log('【DEBUG】开始处理前端单个图片上传请求');
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    console.log('【DEBUG】接收到的文件:', file ? `${file.name}, ${file.size} 字节, ${file.type}` : '未接收到文件');
    
    if (!file) {
      console.error('【DEBUG】上传失败: 未找到图片');
      return NextResponse.json({ success: false, message: '未找到图片' }, { status: 400 });
    }
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      const error = `图片大小超过限制(${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB)`;
      console.error(`【DEBUG】${error}`);
      return NextResponse.json({ 
        success: false, 
        message: error
      }, { status: 400 });
    }
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const error = '不支持的图片格式，请上传JPG、PNG、GIF或WEBP格式的图片';
      console.error(`【DEBUG】${error}, 当前类型: ${file.type}`);
      return NextResponse.json({ 
        success: false, 
        message: error
      }, { status: 400 });
    }
    
    // 获取文件扩展名
    const extension = file.name.split('.').pop() || 'jpg';
    
    // 生成唯一的文件名
    const fileName = `${uuidv4()}.${extension}`;
    console.log(`【DEBUG】生成的文件名: ${fileName}`);
    
    // 添加认证头，从请求中获取并传递
    const authHeader = request.headers.get('Authorization') || '';
    console.log('【DEBUG】认证头:', authHeader ? '已设置' : '未设置');
    
    // 构建上传URL
    const uploadUrl = `${BACKEND_API_URL}/upload/image`;
    console.log('【DEBUG】上传地址:', uploadUrl);
    
    // 直接将文件发送到后端API进行保存
    const backendFormData = new FormData();
    backendFormData.append('image', file, fileName);
    
    console.log('【DEBUG】开始发送请求到后端API');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: authHeader ? { 'Authorization': authHeader } : {},
      body: backendFormData,
    });
    
    console.log('【DEBUG】后端响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = '';
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData);
        console.error('【DEBUG】后端响应错误详情:', errorMessage);
      } catch {
        console.error('上传到后端失败');
        
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
    
    // 返回成功响应
    console.log('【DEBUG】图片上传完成，返回结果');
    return NextResponse.json({
      success: true,
      data: {
        url: data.data.url || data.data.path || `/images/${fileName}`, // 用后端返回的图片路径
        fileName: fileName
      }
    });
    
  } catch (error) {
    console.error('【DEBUG】图片上传过程中发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : '图片上传失败',
      error: error instanceof Error ? error.stack : '未知错误'
    }, { status: 500 });
  }
} 