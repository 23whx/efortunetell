-- 1) 修复支付订单 RLS：此前 "系统可以更新支付订单" 允许任何登录用户把任意订单改成已支付。
--    支付通道目前关闭；以后接入真实支付时，回调应在服务端用 service_role key 更新订单（service_role 绕过 RLS），
--    不需要任何面向用户的 UPDATE 策略。
DROP POLICY IF EXISTS "系统可以更新支付订单" ON payment_orders;
-- 用户可直接 INSERT 一条 payment_status='paid' 的订单，同样关闭（下单应由服务端完成）
DROP POLICY IF EXISTS "用户可以创建支付订单" ON payment_orders;
-- 用户可以改自己预约的 status / admin_notes（例如自己标记为 confirmed）；前端从不更新预约，管理员走 "管理员可以查看所有预约"(FOR ALL)
DROP POLICY IF EXISTS "用户可以更新自己的预约" ON appointments;

-- 2) 付费 AI 接口每日调用限额（按用户、按北京时间自然日计数）
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

-- 只读自己的记录；写入只能通过下面的 SECURITY DEFINER 函数
CREATE POLICY "用户可以查看自己的AI调用次数"
  ON ai_usage_daily FOR SELECT
  USING (auth.uid() = user_id);

-- 原子地消耗一次额度：未超限返回 true 并计数，已用完返回 false。管理员不受限。
CREATE OR REPLACE FUNCTION consume_ai_quota(p_limit INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := (NOW() AT TIME ZONE 'Asia/Shanghai')::DATE;
  used INTEGER;
BEGIN
  IF uid IS NULL OR p_limit < 1 THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'admin') THEN
    RETURN TRUE;
  END IF;

  INSERT INTO ai_usage_daily (user_id, usage_date, calls)
  VALUES (uid, today, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET calls = ai_usage_daily.calls + 1
  WHERE ai_usage_daily.calls < p_limit
  RETURNING calls INTO used;

  RETURN used IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION consume_ai_quota(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION consume_ai_quota(INTEGER) TO authenticated;
