import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateBaziTrendReport } from '@/lib/ai/bazi-trend';
import type { Gender } from '@/lib/bazi/luck';
import { consumeAiQuota, quotaExceededResponse } from '@/lib/ai/quota';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consultationId, language = 'zh-CN', force = false } = body as {
      consultationId?: string;
      language?: string;
      force?: boolean;
    };

    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultationId' }, { status: 400 });
    }

    const { data: consultation, error: cErr } = await supabase
      .from('ai_consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('user_id', user.id)
      .single();

    if (cErr || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // cache hit
    if (!force && consultation.trend_report && consultation.trend_report_language === language) {
      return NextResponse.json({ report: consultation.trend_report });
    }

    if (!(await consumeAiQuota(supabase))) {
      return quotaExceededResponse();
    }

    const birthDate = new Date(consultation.birth_date).toISOString().split('T')[0];
    const birthTime = consultation.birth_time as string;
    const gender = (consultation.gender || 'female') as Gender; // 默认 female，避免空值导致 API 失败

    const report = await generateBaziTrendReport({
      birthDate,
      birthTime,
      gender,
      language,
      horizonYears: 12,
    });

    await supabase
      .from('ai_consultations')
      .update({
        trend_report: report,
        trend_report_language: language,
        trend_report_generated_at: new Date().toISOString(),
      })
      .eq('id', consultationId);

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Trend report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


