/**
 * 根据用户角色和信息获取头像路径
 * @param user 用户信息对象
 * @returns 头像图片路径
 */
export function getAvatarPath(user: any): string {
  // 如果没有用户信息，返回默认用户头像
  if (!user) {
    return '/user_img.png';
  }

  // 根据用户角色返回对应头像
  if (user.role === 'admin' || user.username === 'admin') {
    return '/admin_img.jpg';
  } else {
    return '/user_img.png';
  }
}

/**
 * 根据用户名获取显示名称
 * @param user 用户信息对象
 * @returns 显示的用户名
 */
export function getDisplayName(user: any): string {
  // 调试信息
  console.log('🔍 [getDisplayName] 用户信息:', user);
  
  // 如果没有用户信息，返回默认名称
  if (!user) {
    console.log('🔍 [getDisplayName] 无用户信息，返回"作者"');
    return '作者';
  }

  // 如果是admin用户，显示为Rollkey
  if (user.username === 'admin' || user.role === 'admin') {
    console.log('🔍 [getDisplayName] 检测到管理员，返回"Rollkey"');
    return 'Rollkey';
  }

  // 其他用户显示原始用户名
  const displayName = user.username || '作者';
  console.log('🔍 [getDisplayName] 普通用户，返回:', displayName);
  return displayName;
} 