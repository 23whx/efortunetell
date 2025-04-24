// 后端API基础URL
export const API_BASE_URL = 'http://localhost:5000';

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
  SEND_RESET_CODE: `${API_BASE_URL}/api/auth/send-reset-code`,
  VERIFY_RESET_CODE: `${API_BASE_URL}/api/auth/verify-reset-code`,
};

// 创建带有认证令牌的请求头
export const getAuthHeaders = () => {
  // 尝试从本地存储获取令牌
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const token = user.token || admin.token || '';

  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
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