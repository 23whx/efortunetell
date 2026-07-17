import { allHanzi, getHanzi, splitSurname } from './lookup';
import { computeXiYong } from './xiyong';
import type { GeneratedName, HanziRecord, NameGenerateInput, Wuxing } from './types';

/** 好听优先的双字名素材池（男/女向 + 中性） */
const MALE_PAIRS = [
  '浩然', '子轩', '宇轩', '俊杰', '宇航', '皓轩', '梓豪', '明轩', '思远', '志强',
  '天佑', '文博', '嘉懿', '煜城', '智渊', '弘文', '哲瀚', '雨泽', '鹏飞', '立诚',
  '鸿涛', '烨伟', '苑博', '伟泽', '熠彤', '懿轩', '烨霖', '哲彦', '致远', '俊驰',
  '修杰', '黎昕', '远航', '旭尧', '鸿煊', '博涛', '烨霖', '伟祺', '荣轩', '越泽',
];

const FEMALE_PAIRS = [
  '雨桐', '欣怡', '诗涵', '梓涵', '梦瑶', '可馨', '语嫣', '清妍', '雅静', '雨嘉',
  '一诺', '若曦', '静怡', '语桐', '佳琦', '思涵', '晓彤', '婉儿', '雅芝', '怡君',
  '语汐', '梦洁', '可欣', '美琳', '雪晴', '慧妍', '婧琪', '碧萱', '漫妮', '灵芸',
  '天娇', '婧瑶', '歆瑶', '依娜', '昆凌', '芸汐', '若晴', '清菡', '雨婷', '雅芙',
];

const NEUTRAL_PAIRS = [
  '安然', '清和', '明远', '怀瑾', '知行', '立夏', '望舒', '景行', '思齐', '若水',
  '子期', '云舒', '星河', '南乔', '北辰', '东篱', '西洲', '听澜', '念安', '知夏',
];

function scoreChar(h: HanziRecord, xi: Wuxing[], ji: Wuxing[]): number {
  let s = 0;
  if (xi.includes(h.wuxing as Wuxing)) s += 10;
  if (xi[0] === h.wuxing) s += 4;
  if (ji.includes(h.wuxing as Wuxing)) s -= 8;
  // 好听：笔画适中
  if (h.kangxi >= 5 && h.kangxi <= 16) s += 2;
  if (h.kangxi > 20) s -= 2;
  return s;
}

function resolvePair(pair: string): HanziRecord[] | null {
  const a = getHanzi(pair[0]);
  const b = getHanzi(pair[1]);
  if (!a || !b) return null;
  return [a, b];
}

function buildFromPool(
  surname: string,
  gender: 'male' | 'female',
  xi: Wuxing[],
  ji: Wuxing[],
  count: number
): GeneratedName[] {
  const pool =
    gender === 'male'
      ? [...MALE_PAIRS, ...NEUTRAL_PAIRS, ...FEMALE_PAIRS.slice(0, 8)]
      : [...FEMALE_PAIRS, ...NEUTRAL_PAIRS, ...MALE_PAIRS.slice(0, 8)];

  const scored: GeneratedName[] = [];
  for (const pair of pool) {
    const chars = resolvePair(pair);
    if (!chars) continue;
    const sc =
      scoreChar(chars[0], xi, ji) + scoreChar(chars[1], xi, ji) + Math.random() * 1.5;
    const matched = chars.filter((c) => xi.includes(c.wuxing as Wuxing)).map((c) => c.wuxing);
    scored.push({
      fullName: surname + pair,
      surname,
      given: pair,
      chars,
      score: Math.round(sc * 10) / 10,
      reason:
        matched.length > 0
          ? `用字五行偏喜用（${[...new Set(matched)].join('、')}），读音顺口。`
          : `读音流畅，五行中性可用。`,
    });
  }

  // 补：从「宜名」字库按喜用拼双字（排除典型姓氏用字）
  const SURNAME_ONLY = new Set(
    '王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘蒋蔡余杜叶程魏苏吕丁任卢姚沈钟姜崔谭陆范汪廖石金韦贾夏付方邹熊白孟秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤'.split(
      ''
    )
  );
  const xiChars = allHanzi().filter(
    (h) =>
      xi.includes(h.wuxing as Wuxing) &&
      !SURNAME_ONLY.has(h.char) &&
      h.kangxi >= 4 &&
      h.kangxi <= 18
  );
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // 好听库优先：给已有 pool 项加分
  for (const n of scored) {
    if (MALE_PAIRS.includes(n.given) || FEMALE_PAIRS.includes(n.given) || NEUTRAL_PAIRS.includes(n.given)) {
      n.score += 8;
    }
  }
  const A = shuffle(xiChars).slice(0, 24);
  const B = shuffle(xiChars).slice(0, 24);
  for (const c1 of A) {
    for (const c2 of B) {
      if (c1.char === c2.char) continue;
      const given = c1.char + c2.char;
      if (scored.some((x) => x.given === given)) continue;
      const sc = scoreChar(c1, xi, ji) + scoreChar(c2, xi, ji);
      if (sc < 16) continue;
      scored.push({
        fullName: surname + given,
        surname,
        given,
        chars: [c1, c2],
        score: sc + Math.random() * 0.5,
        reason: `双字均贴近喜用（${c1.wuxing}+${c2.wuxing}）。`,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  // unique given
  const seen = new Set<string>();
  const out: GeneratedName[] = [];
  for (const n of scored) {
    if (seen.has(n.given)) continue;
    seen.add(n.given);
    out.push(n);
    if (out.length >= count) break;
  }
  return out;
}

export function generateNames(input: NameGenerateInput): {
  xiYong: ReturnType<typeof computeXiYong>;
  names: GeneratedName[];
  surname: string;
} {
  const { surname: sn } = splitSurname(input.surname);
  const surname = sn || input.surname.trim() || '李';
  const xiYong = computeXiYong({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    ziMode: input.ziMode,
  });
  const names = buildFromPool(
    surname,
    input.gender,
    xiYong.xi,
    xiYong.ji,
    input.count ?? 3
  );
  return { xiYong, names, surname };
}
