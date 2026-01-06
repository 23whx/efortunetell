import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateBaziConsultation } from '@/lib/ai/bazi-consultant';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // 验证用户登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { consultationId, question, language = 'zh-CN' } = body;
    
    if (!consultationId || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // 1. 获取咨询会话信息
    const { data: consultation, error: consultationError } = await supabase
      .from('ai_consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('user_id', user.id)
      .single();
    
    if (consultationError || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    
    // 2. 免费试用，不需要支付验证
    
    // 3. 生成AI回复
    const birthDate = new Date(consultation.birth_date).toISOString().split('T')[0];
    const birthTime = consultation.birth_time;
    const chatHistory = consultation.chat_history || [];
    
    const result = await generateBaziConsultation({
      birthDate,
      birthTime,
      userQuestion: question,
      chatHistory,
      language,
    });
    
    // 4. 更新聊天记录
    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: question, timestamp: new Date().toISOString() },
      { role: 'assistant', content: result.reply, timestamp: new Date().toISOString() },
    ];
    
    const { error: updateError } = await supabase
      .from('ai_consultations')
      .update({
        chat_history: newChatHistory,
        total_messages: consultation.total_messages + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', consultationId);
    
    if (updateError) {
      console.error('Failed to update consultation:', updateError);
    }
    
    return NextResponse.json({
      reply: result.reply,
      suggestUpgrade: result.suggestUpgrade,
      messageCount: consultation.total_messages + 1,
    });
  } catch (error) {
    console.error('AI consultation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

