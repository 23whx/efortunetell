import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateChatSummary } from '@/lib/ai/bazi-consultant';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { consultationId, userName, userContact, requirements } = body;
    
    if (!consultationId || !userName || !userContact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 获取咨询会话信息
    const { data: consultation, error: consultationError } = await supabase
      .from('ai_consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('user_id', user.id)
      .single();
    
    if (consultationError || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    
    // 生成聊天记录摘要
    const chatSummary = generateChatSummary(consultation.chat_history || []);
    
    // 创建预约
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        user_id: user.id,
        consultation_id: consultationId,
        service_type: 'fortune_service',
        user_name: userName,
        user_contact: userContact,
        birth_info: {
          birth_date: consultation.birth_date,
          birth_time: consultation.birth_time,
        },
        bazi: consultation.bazi,
        chat_summary: chatSummary,
        requirements,
        status: 'pending',
      })
      .select()
      .single();
    
    if (appointmentError) {
      console.error('Failed to create appointment:', appointmentError);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }
    
    // 更新咨询状态为已升级
    await supabase
      .from('ai_consultations')
      .update({ status: 'upgraded' })
      .eq('id', consultationId);
    
    return NextResponse.json({
      appointmentId: appointment.id,
      message: 'Appointment created successfully',
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

