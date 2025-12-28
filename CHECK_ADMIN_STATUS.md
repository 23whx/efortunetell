# 检查和设置管理员权限

## 问题：登录了管理员账号，但显示普通用户界面

### 原因分析
系统判断管理员是通过 `profiles` 表中的 `role` 字段，如果该字段不是 `'admin'`，就会被视为普通用户。

### 解决方案

#### 步骤 1：查看当前登录用户的 ID 和 role

打开 **Supabase Dashboard > SQL Editor**，执行：

```sql
-- 查看所有用户及其角色
SELECT id, email, role, created_at 
FROM auth.users 
JOIN public.profiles ON auth.users.id = public.profiles.id 
ORDER BY created_at DESC;
```

找到您的账号对应的 `id`（一长串 UUID）。

---

#### 步骤 2：设置管理员权限

**方法 A：如果您知道自己的用户 ID**

```sql
-- 将指定用户设置为管理员（替换 'YOUR_USER_ID' 为您的实际 UUID）
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

**方法 B：如果您知道自己的邮箱地址**

```sql
-- 通过邮箱设置管理员权限（替换 'your@email.com' 为您的实际邮箱）
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

**方法 C：设置当前登录用户为管理员（最简单）**

如果您在 Supabase 的 SQL Editor 中已经登录，可以直接执行：

```sql
-- 将当前登录的用户设置为管理员
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = auth.uid();
```

---

#### 步骤 3：验证权限是否生效

```sql
-- 查看您的账号信息
SELECT p.id, u.email, p.role, p.display_name
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your@email.com';  -- 替换为您的邮箱
```

应该看到 `role` 列显示为 `admin`。

---

#### 步骤 4：重新登录

1. 在网站上**退出登录**（点击右上角头像 > 退出）
2. 重新登录
3. 现在应该能看到**管理面板**入口了（右上角头像下拉菜单中会有"管理面板"选项）

---

### 常见问题

**Q1: 执行 SQL 后还是普通用户界面？**
- **A**: 需要退出并重新登录，系统才会重新读取您的 role。或者硬刷新页面（Ctrl+Shift+R）。

**Q2: 找不到我的用户 ID？**
- **A**: 执行以下 SQL 查看所有用户：
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
```

**Q3: 执行 SQL 提示权限不足？**
- **A**: 确保您在 Supabase Dashboard 的 SQL Editor 中执行，而不是在应用的前端。

---

### 自动化脚本（可选）

如果您经常需要设置管理员，可以在 `schema.sql` 中添加一个辅助函数：

```sql
-- 创建设置管理员的函数
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE id = (SELECT id FROM auth.users WHERE email = user_email);
END;
$$;

-- 使用示例：
-- SELECT public.set_user_as_admin('your@email.com');
```

---

### 验证清单

- [ ] 在 SQL Editor 中查看用户 role
- [ ] 执行 UPDATE 语句设置 role = 'admin'
- [ ] 验证 role 已更新
- [ ] 退出当前登录
- [ ] 重新登录
- [ ] 查看右上角是否出现"管理面板"入口
- [ ] 能够访问 `/admin/dashboard`

完成后，您就能看到完整的管理员界面了！

