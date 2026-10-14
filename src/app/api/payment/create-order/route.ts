import { NextResponse } from 'next/server';
import { CONTACT_EMAIL } from '@/lib/site';

// 支付通道暂时关闭：没有真实收款渠道之前不创建订单，咨询改为邮件联系。
// 以前的实现信任客户端传入的 amount，并跳转到可在浏览器里把订单改为"已支付"的模拟支付页（见 git 历史）。
// 重新开放时：金额必须在服务端按 serviceType 定价，订单状态只能由支付回调用 service_role 更新。
export async function POST() {
  return NextResponse.json(
    { error: 'payments_closed', contact: CONTACT_EMAIL },
    { status: 503 }
  );
}
