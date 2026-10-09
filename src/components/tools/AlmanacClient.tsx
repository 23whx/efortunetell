'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { withLocale } from '@/lib/i18n/config';
import {
  getAlmanacDay,
  getAlmanacMonth,
  shiftDateKey,
  type AlmanacDay,
} from '@/lib/paipan/almanac';
import { useLanguage } from '@/contexts/LanguageContext';

const WEEK_HEADERS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_HEADERS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function TagList({
  items,
  tone,
}: {
  items: string[];
  tone: 'yi' | 'ji' | 'neutral';
}) {
  if (!items.length) return <span className="text-gray-400 text-sm">—</span>;
  const cls =
    tone === 'yi'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
      : tone === 'ji'
        ? 'bg-rose-50 text-rose-800 border-rose-100'
        : 'bg-gray-50 text-gray-700 border-gray-100';
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((x) => (
        <span
          key={x}
          className={`inline-flex px-2 py-0.5 rounded-md text-xs border ${cls}`}
        >
          {x}
        </span>
      ))}
    </div>
  );
}

function PillarCard({
  title,
  ganZhi,
  naYin,
}: {
  title: string;
  ganZhi: string;
  naYin: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-[#f0ece3] shadow-sm p-4 text-center">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold tracking-widest text-gray-900">{ganZhi}</div>
      <div className="text-xs text-amber-700/80 mt-1">{naYin}</div>
    </div>
  );
}

export default function AlmanacClient({
  locale,
  initialDate,
  initialDay,
}: {
  locale: Locale;
  initialDate: string;
  initialDay: AlmanacDay;
}) {
  const { t, language } = useLanguage();
  const [date, setDate] = useState(initialDate);
  const [day, setDay] = useState<AlmanacDay>(initialDay);
  const [viewYear, setViewYear] = useState(initialDay.year);
  const [viewMonth, setViewMonth] = useState(initialDay.month);

  const weekHeaders = language === 'zh' ? WEEK_HEADERS_ZH : WEEK_HEADERS_EN;

  const monthCells = useMemo(
    () => getAlmanacMonth(viewYear, viewMonth, date),
    [viewYear, viewMonth, date]
  );

  const goDate = (next: string) => {
    const d = getAlmanacDay(next);
    if (!d) return;
    setDate(next);
    setDay(d);
    setViewYear(d.year);
    setViewMonth(d.month);
    // update URL without full RSC navigation for snappy UX; SEO day pages still exist
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        withLocale(locale, `/tools/almanac/${next}`)
      );
    }
  };

  const shiftMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-sm text-amber-800/80 mb-3">
          <CalendarDays className="w-4 h-4" />
          <Link
            href={withLocale(locale, '/tools')}
            className="hover:text-[#FF6F61] transition-colors"
          >
            {t('tools.title')}
          </Link>
          <span>/</span>
          <span>{t('tools.almanac')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {t('almanac.title')}
        </h1>
        <p className="mt-2 text-gray-600 max-w-2xl">{t('almanac.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Month grid */}
        <section className="rounded-2xl bg-white/80 border border-[#f0ece3] shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 rounded-xl hover:bg-amber-50 text-gray-600"
              aria-label="prev month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-bold text-gray-900">
              {viewYear}-{String(viewMonth).padStart(2, '0')}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-2 rounded-xl hover:bg-amber-50 text-gray-600"
              aria-label="next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekHeaders.map((w) => (
              <div
                key={w}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((cell) => {
              const selected = cell.date === date;
              return (
                <button
                  key={cell.date + (cell.isCurrentMonth ? 'c' : 'o')}
                  type="button"
                  onClick={() => goDate(cell.date)}
                  className={[
                    'min-h-[68px] rounded-xl p-1.5 text-left transition-all border',
                    selected
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-md'
                      : cell.isToday
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white/60 border-transparent hover:border-[#f0ece3] hover:bg-amber-50/60',
                    !cell.isCurrentMonth ? 'opacity-40' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-bold">{cell.day}</span>
                    {(cell.term || cell.festival) && (
                      <span
                        className={`text-[9px] leading-tight max-w-[3.2rem] truncate ${
                          selected ? 'text-white/90' : 'text-[#FF6F61]'
                        }`}
                      >
                        {cell.term || cell.festival}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      selected ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {cell.lunarDayCn}
                  </div>
                  {cell.yiTop && (
                    <div
                      className={`text-[9px] mt-0.5 truncate ${
                        selected ? 'text-white/70' : 'text-emerald-700'
                      }`}
                    >
                      {cell.yiTop}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Day detail */}
        <section className="space-y-4">
          <div className="rounded-2xl bg-[#221d17] text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#FF6F61] to-[#ffb347]" />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => goDate(shiftDateKey(date, -1))}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {day.date} · {language === 'zh' ? `星期${day.weekNameZh}` : day.weekName}
                </div>
                <div className="font-display text-2xl md:text-3xl mt-2 tracking-wide">
                  {day.lunar.full}
                </div>
                <div className="text-sm mt-2 text-white/70">
                  {t('almanac.zodiacYear')}: {day.lunar.yearShengXiao} · {day.constellation}
                </div>
              </div>
              <button
                type="button"
                onClick={() => goDate(shiftDateKey(date, 1))}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && goDate(e.target.value)}
                className="rounded-xl bg-white/20 border border-white/30 px-3 py-1.5 text-sm text-white"
              />
              <Link
                href={withLocale(locale, `/tools/almanac/${date}`)}
                className="rounded-xl bg-white text-[#FF6F61] px-3 py-1.5 text-sm font-semibold"
              >
                {t('almanac.permalink')}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <PillarCard
              title={t('almanac.yearPillar')}
              ganZhi={day.pillars.year.ganZhi}
              naYin={day.pillars.year.naYin}
            />
            <PillarCard
              title={t('almanac.monthPillar')}
              ganZhi={day.pillars.month.ganZhi}
              naYin={day.pillars.month.naYin}
            />
            <PillarCard
              title={t('almanac.dayPillar')}
              ganZhi={day.pillars.day.ganZhi}
              naYin={day.pillars.day.naYin}
            />
            <PillarCard
              title={t('almanac.hourPillar')}
              ganZhi={day.pillars.time?.ganZhi || '—'}
              naYin={day.pillars.time?.naYin || ''}
            />
          </div>

          <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-emerald-700 mb-2">{t('almanac.yi')}</h3>
              <TagList items={day.yi} tone="yi" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-700 mb-2">{t('almanac.ji')}</h3>
              <TagList items={day.ji} tone="ji" />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">{t('almanac.meta')}</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.chong')}</dt>
                <dd className="font-medium text-right">{day.chong || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.sha')}</dt>
                <dd className="font-medium text-right">{day.sha || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.jianChu')}</dt>
                <dd className="font-medium text-right">{day.jianChu || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.xiu')}</dt>
                <dd className="font-medium text-right">
                  {day.xiu} ({day.xiuLuck})
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.tianShen')}</dt>
                <dd className="font-medium text-right">
                  {day.tianShen} · {day.tianShenType}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5">
                <dt className="text-gray-500">{t('almanac.yueXiang')}</dt>
                <dd className="font-medium text-right">{day.lunar.yueXiang || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5 sm:col-span-2">
                <dt className="text-gray-500">{t('almanac.pengZu')}</dt>
                <dd className="font-medium text-right text-xs md:text-sm">
                  {day.pengZuGan}；{day.pengZuZhi}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-gray-50 py-1.5 sm:col-span-2">
                <dt className="text-gray-500">{t('almanac.solarTerms')}</dt>
                <dd className="font-medium text-right text-xs md:text-sm">
                  {day.solarTerms.current
                    ? day.solarTerms.current
                    : `${day.solarTerms.prevJie || '—'} → ${day.solarTerms.nextJie || '—'}`}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">{t('almanac.positions')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(
                [
                  ['xi', day.positions.xi],
                  ['fu', day.positions.fu],
                  ['cai', day.positions.cai],
                  ['yangGui', day.positions.yangGui],
                  ['yinGui', day.positions.yinGui],
                  ['taiSui', day.positions.taiSui],
                  ['taiShen', day.positions.taiShen],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-2 rounded-xl bg-amber-50/50 px-3 py-2"
                >
                  <span className="text-gray-500">{t(`almanac.pos.${k}`)}</span>
                  <span className="font-medium">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-2">{t('almanac.jiShen')}</h3>
            <TagList items={day.jiShen} tone="neutral" />
            <h3 className="text-sm font-bold text-gray-800 mt-4 mb-2">{t('almanac.xiongSha')}</h3>
            <TagList items={day.xiongSha} tone="ji" />
          </div>

          <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-bold text-gray-800 mb-3">{t('almanac.hours')}</h3>
            <div className="min-w-[520px] grid grid-cols-4 gap-2">
              {day.hours.map((h) => (
                <div
                  key={h.zhi}
                  className="rounded-xl border border-gray-100 p-2.5 bg-gradient-to-b from-white to-amber-50/30"
                >
                  <div className="font-bold text-gray-900">
                    {h.zhi}时 <span className="text-xs font-normal text-gray-500">{h.ganZhi}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mb-1">{h.label}</div>
                  <div className="text-[10px] text-emerald-700 truncate">
                    宜 {h.yi.slice(0, 3).join('、') || '—'}
                  </div>
                  <div className="text-[10px] text-rose-700 truncate">
                    忌 {h.ji.slice(0, 3).join('、') || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
