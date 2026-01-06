import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// 生成订单号
function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AI${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { serviceType, amount, paymentMethod, metadata } = body;
    
    if (!serviceType || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 创建支付订单
    const orderNo = generateOrderNo();
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        order_no: orderNo,
        service_type: serviceType,
        amount,
        currency: 'CNY',
        payment_method: paymentMethod,
        payment_status: 'pending',
        metadata,
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
    
    // TODO: 这里应该调用支付宝/微信支付API生成支付二维码或链接
    // 目前返回模拟数据
    return NextResponse.json({
      orderId: order.id,
      orderNo: order.order_no,
      amount: order.amount,
      paymentMethod: order.payment_method,
      // 实际应该返回支付二维码URL或支付链接
      paymentUrl: `/payment/mock?orderId=${order.id}`,
      qrCode: `/api/payment/qrcode?orderId=${order.id}`,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

