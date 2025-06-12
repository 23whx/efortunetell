import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// 确保目录存在
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 图片存储目录
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
ensureDirectoryExists(IMAGES_DIR);

// 保存Base64图片到公共目录
export const saveBase64Image = async (base64Data: string): Promise<{ fileName: string, url: string }> => {
  try {
    // 移除base64前缀
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) {
      throw new Error('Invalid base64 image data');
    }
    
    // 生成唯一文件名
    const fileName = `${uuidv4()}.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    
    // 将base64转换为文件并保存
    fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
    
    // 返回访问URL (相对于公共目录)
    return {
      fileName,
      url: `/images/${fileName}`
    };
  } catch (error) {
    console.error('保存图片错误:', error);
    throw error;
  }
};

// 保存Blob/File对象到公共目录
export const saveImageFile = async (file: File): Promise<{ fileName: string, url: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || typeof event.target.result !== 'string') {
            throw new Error('Failed to read file');
          }
          
          const base64Data = event.target.result;
          const result = await saveBase64Image(base64Data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// 在Next.js API路由中使用的服务器端图片保存函数
export const saveImageServerSide = async (base64Data: string): Promise<{ fileName: string, url: string }> => {
  try {
    return await saveBase64Image(base64Data);
  } catch (error) {
    console.error('服务器端保存图片错误:', error);
    throw error;
  }
}; 