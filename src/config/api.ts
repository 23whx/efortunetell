// 后端API基础URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// API路径
export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  GET_USER: `${API_BASE_URL}/api/auth/me`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgotpassword`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/resetpassword`,
  BLOGS: `${API_BASE_URL}/api/blogs`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  SERVICES: `${API_BASE_URL}/api/services`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  COMMENTS: `${API_BASE_URL}/api/comments`,
  SEND_RESET_CODE: `${API_BASE_URL}/api/auth/send-reset-code`,
  VERIFY_RESET_CODE: `${API_BASE_URL}/api/auth/verify-reset-code`,
};

// 检查是否在浏览器环境中
export const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// 安全地获取存储的数据
export const getLocalStorage = (key: string) => {
  if (!isBrowser()) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`读取localStorage[${key}]失败:`, error);
    return null;
  }
};

// 创建带有认证令牌的请求头（支持服务器端和客户端使用）
export const getAuthHeaders = () => {
  // 在服务器环境中返回基本头信息
  if (!isBrowser()) {
    return {
      'Content-Type': 'application/json',
      'Authorization': '',
    };
  }
  
  // 在浏览器环境中从localStorage获取令牌
  try {
    // 直接尝试读取localStorage，如果出错会被catch捕获
    let token = '';
    
    // 首先尝试直接从token字段获取
    const directToken = localStorage.getItem('token');
    if (directToken) {
      token = directToken;
    }
    
    // 如果直接token不存在，尝试从用户信息中获取token
    if (!token) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && user.token) {
          token = user.token;
        }
      }
    }
    
    // 如果用户token不存在，尝试从管理员信息中获取
    if (!token) {
      const adminJson = localStorage.getItem('admin');
      if (adminJson) {
        const admin = JSON.parse(adminJson);
        if (admin && admin.token) {
          token = admin.token;
        }
      }
    }
    
    console.log('获取到认证token:', token ? '有效token' : '无token');

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
  } catch (error) {
    console.error('读取用户令牌失败:', error);
    return {
      'Content-Type': 'application/json',
      'Authorization': '',
    };
  }
};

// 统一的API请求函数
export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('发生未知错误');
  }
}

// 记录认证失败次数，按URL分别记录
const authFailureCounts: Record<string, number> = {};

/**
 * 包含认证的fetch请求
 * @param url API路径
 * @param options 请求选项
 * @returns fetch响应
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = '';
  
  // 检查是否在客户端
  if (typeof window !== 'undefined') {
    // 首先尝试直接从token字段获取
    const directToken = localStorage.getItem('token');
    if (directToken) {
      token = directToken;
    }
    
    // 如果没有直接token，优先检查管理员token
    if (!token) {
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          token = admin.token;
        } catch (e) {
          console.error('解析管理员信息失败', e);
        }
      }
    }
    
    // 如果没有管理员token，则尝试获取用户token
    if (!token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          token = user.token;
        } catch (e) {
          console.error('解析用户信息失败', e);
        }
      }
    }
  }
  
  // 设置请求头
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 合并选项
  const mergedOptions: RequestInit = {
    ...options,
    headers
  };
  
  // 发送请求
  return fetch(url, mergedOptions);
};

/**
 * 获取后端API的基础URL
 * @returns 后端API基础URL
 */
export const getBackendURL = (): string => {
  // 从环境变量中获取，或使用默认值
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
};

// 图片URL处理函数 - 使用Next.js代理
export const getImageUrl = (imagePath: string): string => {
  console.log('🌐 [getImageUrl] 输入路径:', imagePath);
  
  if (!imagePath) {
    console.log('🌐 [getImageUrl] 路径为空，返回空字符串');
    return '';
  }
  
  // 如果是完整的外部URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🌐 [getImageUrl] 检测到外部URL:', imagePath);
    // 如果是我们自己的API服务器，转换为相对路径以使用代理
    if (imagePath.includes(API_BASE_URL)) {
      const path = imagePath.replace(API_BASE_URL, '');
      const result = path.startsWith('/') ? path : `/${path}`;
      console.log('🌐 [getImageUrl] 转换API服务器URL为相对路径:', result);
      return result;
    }
    console.log('🌐 [getImageUrl] 外部URL直接返回:', imagePath);
    return imagePath;
  }
  
  // 如果是blob URL，直接返回
  if (imagePath.startsWith('blob:')) {
    console.log('🌐 [getImageUrl] blob URL直接返回:', imagePath);
    return imagePath;
  }
  
  // 如果已经是以 /images/ 开头的路径，直接返回（通过Next.js代理）
  if (imagePath.startsWith('/images/')) {
    console.log('🌐 [getImageUrl] /images/路径直接返回:', imagePath);
    return imagePath;
  }
  
  // 如果是以 images/ 开头但没有前置斜杠，添加斜杠
  if (imagePath.startsWith('images/')) {
    const result = `/${imagePath}`;
    console.log('🌐 [getImageUrl] images/路径添加前缀:', result);
    return result;
  }
  
  // 其他情况（如文件名），默认放在 /images/ 目录下
  const result = `/images/${imagePath}`;
  console.log('🌐 [getImageUrl] 其他情况添加/images/前缀:', result);
  return result;
};

// 图片URL验证和回退处理函数
export const getImageUrlWithFallback = async (imagePath: string): Promise<string> => {
  if (!imagePath) return '/images/default-image.svg';
  
  const imageUrl = getImageUrl(imagePath);
  
  try {
    // 尝试检查图片是否存在（通过Next.js代理）
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (response.ok) {
      return imageUrl;
    } else {
      console.warn(`图片不存在: ${imageUrl}`);
      return '/images/default-image.svg';
    }
  } catch (error) {
    console.warn(`图片检查失败: ${imageUrl}`, error);
    return '/images/default-image.svg';
  }
}; 