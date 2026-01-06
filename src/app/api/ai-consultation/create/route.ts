import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateBaZi } from '@/lib/bazi/calendar';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { birthDate, birthTime, paymentOrderId, gender } = body;
    
    if (!birthDate || !birthTime) {
      return NextResponse.json({ error: 'Missing birth information' }, { status: 400 });
    }
    
    // 免费试用，不需要支付验证
    
    // 计算八字
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    const datetime = new Date(year, month - 1, day, hour, minute);
    const bazi = calculateBaZi(datetime);
    
    // 创建咨询会话
    const { data: consultation, error: consultationError } = await supabase
      .from('ai_consultations')
      .insert({
        user_id: user.id,
        payment_order_id: paymentOrderId,
        birth_date: birthDate,
        birth_time: birthTime,
        gender: gender || null,
        // jsonb column expects an object; do not stringify
        bazi,
        status: 'active',
        total_messages: 0,
        chat_history: [],
      })
      .select()
      .single();
    
    if (consultationError) {
      console.error('Failed to create consultation:', consultationError);
      return NextResponse.json({ error: 'Failed to create consultation' }, { status: 500 });
    }
    
    return NextResponse.json({
      consultationId: consultation.id,
      bazi,
      message: 'Consultation created successfully',
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

