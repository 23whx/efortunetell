-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_no VARCHAR(64) UNIQUE NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- 'ai_consultation', 'fortune_service'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  payment_method VARCHAR(20), -- 'alipay', 'wechat'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'refunded'
  paid_at TIMESTAMPTZ,
  trade_no VARCHAR(128), -- 第三方支付流水号
  metadata JSONB, -- 额外信息
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI咨询会话表
CREATE TABLE IF NOT EXISTS ai_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_order_id UUID REFERENCES payment_orders(id),
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  bazi JSONB NOT NULL, -- 存储八字信息 {year, month, day, hour}
  chat_history JSONB DEFAULT '[]', -- 聊天记录数组
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'upgraded'
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预约管理表
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES ai_consultations(id),
  service_type VARCHAR(50) NOT NULL, -- 'fortune_service'
  user_name VARCHAR(100),
  user_contact VARCHAR(100),
  birth_info JSONB, -- 生日信息
  bazi JSONB, -- 八字信息
  chat_summary TEXT, -- AI咨询记录摘要
  requirements TEXT, -- 用户需求
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  admin_notes TEXT, -- 管理员备注
  payment_order_id UUID REFERENCES payment_orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
CREATE INDEX idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX idx_ai_consultations_user_id ON ai_consultations(user_id);
CREATE INDEX idx_ai_consultations_payment ON ai_consultations(payment_order_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- RLS策略
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- payment_orders RLS
CREATE POLICY "用户可以查看自己的支付订单"
  ON payment_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建支付订单"
  ON payment_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有支付订单"
  ON payment_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "系统可以更新支付订单"
  ON payment_orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ai_consultations RLS
CREATE POLICY "用户可以查看自己的咨询记录"
  ON ai_consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建咨询记录"
  ON ai_consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的咨询记录"
  ON ai_consultations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有咨询记录"
  ON ai_consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- appointments RLS
CREATE POLICY "用户可以查看自己的预约"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建预约"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的预约"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有预约"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_consultations_updated_at BEFORE UPDATE ON ai_consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

