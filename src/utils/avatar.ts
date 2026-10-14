/**
 * 根据用户角色和信息获取头像路径
 * @param user 用户信息对象
 * @returns 头像图片路径
 */
interface User {
  username: string;
  role?: string;
  avatar?: string;
}

export const getAvatarPath = (user: User): string => {
  if (user.avatar) {
    // 完整 URL：http 升级为 https，避免 HTTPS 页面出现混合内容（浏览器"连接不安全"警告）
    if (user.avatar.startsWith('http://')) {
      return `https://${user.avatar.slice('http://'.length)}`;
    }
    if (user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    // 确保路径以 / 开头
    return user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
  }
  
  // 根据用户角色返回对应的默认头像
  if (user.role === 'admin') {
    return '/admin_img.jpg';
  }
  
  // 普通用户默认头像
  return '/user_img.png';
};

/**
 * 根据用户名获取显示名称
 * @param user 用户信息对象
 * @returns 显示的用户名
 */
export const getDisplayName = (user: User): string => {
  let displayName = user.username;
  
  // 特殊处理：admin用户显示为Rollkey
  if (user.username === 'admin' || user.role === 'admin') {
    displayName = 'Rollkey';
  }
  
  // 根据角色添加标识
  if (user.role === 'admin') {
    displayName += ' 👑';
  } else if (user.role === 'vip') {
    displayName += ' ⭐';
  }
  
  return displayName;
}; 