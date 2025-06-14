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
  console.log('🖼️ [getAvatarPath] 输入用户信息:', user);
  
  if (user.avatar) {
    console.log('🖼️ [getAvatarPath] 用户有自定义头像:', user.avatar);
    // 如果是完整的URL，直接返回
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      console.log('🖼️ [getAvatarPath] 返回完整URL:', user.avatar);
      return user.avatar;
    }
    // 确保路径以 / 开头
    const avatarPath = user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`;
    console.log('🖼️ [getAvatarPath] 返回头像路径:', avatarPath);
    return avatarPath;
  }
  
  // 根据用户角色返回对应的默认头像
  if (user.role === 'admin') {
    console.log('🖼️ [getAvatarPath] 返回admin头像: /admin_img.jpg');
    return '/admin_img.jpg';
  }
  
  // 普通用户默认头像
  console.log('🖼️ [getAvatarPath] 返回普通用户头像: /user_img.png');
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
  
  console.log('👤 [getDisplayName] 用户:', user.username, '显示名称:', displayName);
  return displayName;
}; 