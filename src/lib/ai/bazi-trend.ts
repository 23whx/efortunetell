import fs from 'fs';
import path from 'path';
import { chatCompletion, type DeepSeekChatMessage } from '@/lib/deepseek/client';
import { calculateBaZi, getMonthPillar, getYearPillar } from '@/lib/bazi/calendar';
import { generateDayun, type Gender } from '@/lib/bazi/luck';

type TrendReport = {
  title: string;
  subtitle: string;
  timeRangeLabel: string;
  kline: {
    unit: 'year';
    min: number;
    max: number;
    items: Array<{
      label: string;
      open: number;
      high: number;
      low: number;
      close: number;
      tone: 'up' | 'down' | 'flat';
      theme: 'wealth' | 'career' | 'relationship' | 'health' | 'study' | 'family' | 'overall';
      note: string;
    }>;
  };
  highlights: Array<{ label: string; note: string }>;
  advice: { do: string[]; avoid: string[] };
  disclaimer: string;
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'zh-CN': '请用简体中文输出，并保持温柔、专业、克制的语气。',
  'zh-TW': '請用繁體中文輸出，語氣溫柔、專業、克制。',
  en: 'Please output in English with a warm, professional, and restrained tone.',
  ja: '日本語で出力してください。温かく、プロフェッショナルで、節度ある語り口にしてください。',
  ko: '한국어로 출력해 주세요. 따뜻하고 전문적이며 절제된 톤을 유지해 주세요.',
};

function loadTrendPrompt(language: string): string {
  const promptPath = path.join(process.cwd(), 'src/lib/ai/bazi-trend-prompt.md');
  const base = fs.readFileSync(promptPath, 'utf-8');
  const lang = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS['zh-CN'];
  return `${base}\n\n## 输出语言\n${lang}\n`;
}

function safeJsonParse(text: string): any {
  // 1) try full
  try {
    return JSON.parse(text);
  } catch {}
  // 2) try extract first {...} block
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = text.slice(start, end + 1);
    return JSON.parse(sliced);
  }
  throw new Error('Failed to parse JSON from model output');
}

export async function generateBaziTrendReport(params: {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  gender: Gender;
  language: string;
  horizonYears?: number; // default 12
}): Promise<TrendReport> {
  const { birthDate, birthTime, gender, language, horizonYears = 12 } = params;

  const [yy, mm, dd] = birthDate.split('-').map(Number);
  const [hh, min] = birthTime.split(':').map(Number);
  const birthDateTime = new Date(yy, mm - 1, dd, hh, min);

  const natal = calculateBaZi(birthDateTime);
  const monthPillar = getMonthPillar(yy, mm, dd);
  const dayun = generateDayun({ birthDateTime, gender, monthPillar, steps: 9 });

  const now = new Date();
  const startYear = now.getFullYear();
  const years = Array.from({ length: horizonYears }, (_, i) => startYear + i);

  const liunian = years.map((y) => {
    const yp = getYearPillar(y, 3); // 用 3 月避免立春前后边界的误差放大（近似）
    return { year: y, pillar: `${yp.stem}${yp.branch}`, stem: yp.stem, branch: yp.branch };
  });

  // 给模型更结构化的数据，避免输出 markdown
  const inputPayload = {
    natal: {
      pillars: {
        year: natal.year.pillar,
        month: natal.month.pillar,
        day: natal.day.pillar,
        hour: natal.hour.pillar,
      },
      zodiac: natal.year.zodiac,
      datetime: natal.input.datetime,
    },
    dayun: {
      direction: dayun.direction === 1 ? 'forward' : 'backward',
      startAgeYears: Number(dayun.startAgeYears.toFixed(2)),
      items: dayun.items,
    },
    liunian,
    horizon: {
      startYear,
      endYear: startYear + horizonYears - 1,
      count: horizonYears,
    },
  };

  const systemPrompt = loadTrendPrompt(language);
  const messages: DeepSeekChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content:
        '请严格按提示词要求输出 JSON。以下是输入数据（JSON）：\n' +
        JSON.stringify(inputPayload),
    },
  ];

  const res = await chatCompletion(messages, { temperature: 0.6, max_tokens: 1600 });
  const raw = res.choices?.[0]?.message?.content ?? '';
  const parsed = safeJsonParse(raw) as TrendReport;

  // 基本兜底裁剪，避免越界
  parsed.kline.items = (parsed.kline.items || []).slice(0, horizonYears).map((it, idx) => ({
    ...it,
    label: String(years[idx]),
    open: Math.max(0, Math.min(100, Number(it.open))),
    high: Math.max(0, Math.min(100, Number(it.high))),
    low: Math.max(0, Math.min(100, Number(it.low))),
    close: Math.max(0, Math.min(100, Number(it.close))),
  }));

  return parsed;
}


