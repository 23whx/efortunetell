'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookmarkPlus,
  Calculator,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { withLocale } from '@/lib/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  chartBazi,
  type BaZiChart,
  type Gender,
  type ZiMode,
} from '@/lib/paipan/bazi';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type SaveRow = {
  id: string;
  title: string | null;
  chart_type: string;
  params: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: Gender;
    ziMode: ZiMode;
    useTrueSolarTime: boolean;
    longitude?: number;
    pdy?: boolean;
  };
  created_at: string;
};

function PillarColumn({
  title,
  pillar,
  highlightDay,
}: {
  title: string;
  pillar: BaZiChart['siZhu']['year'];
  highlightDay?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 md:p-5 text-center transition-colors ${
        highlightDay
          ? 'bg-white border-[#FF6F61]/40 shadow-sm'
          : 'bg-white border-[#f0ece3]'
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
        {title}
      </div>
      <div className="font-display text-4xl md:text-[2.75rem] leading-none text-gray-900">
        {pillar.gan}
      </div>
      <div className={`text-[10px] mt-1.5 ${highlightDay ? 'text-[#FF6F61] font-semibold' : 'text-gray-400'}`}>
        {pillar.shiShenOnGan}
      </div>
      <div className="font-display text-4xl md:text-[2.75rem] leading-none text-gray-900 mt-2.5">
        {pillar.zhi}
      </div>
      <div className="mt-3 text-[11px] text-gray-500 leading-relaxed min-h-[2.5rem]">
        {pillar.cangGan.map((g, i) => (
          <div key={g + i}>
            {g}
            <span className="text-gray-400">({pillar.shiShenOnCangGan[i]})</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 border-t border-[#f0ece3] pt-2.5">
        {pillar.naYin}
      </div>
      <div className="text-[10px] text-gray-400 mt-1">
        {pillar.wuxingGan}/{pillar.wuxingZhi}
      </div>
    </div>
  );
}

export default function BaziClient({ locale }: { locale: Locale }) {
  const { t } = useLanguage();
  const [datetime, setDatetime] = useState('1994-10-26T12:00');
  const [gender, setGender] = useState<Gender>('male');
  const [ziMode, setZiMode] = useState<ZiMode>('late');
  const [useTrueSolar, setUseTrueSolar] = useState(false);
  const [longitude, setLongitude] = useState('116.4');
  const [pdy, setPdy] = useState(false);
  const [chart, setChart] = useState<BaZiChart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saves, setSaves] = useState<SaveRow[]>([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const loadSaves = useCallback(async (uid: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: err } = await supabase
        .from('chart_saves')
        .select('id,title,chart_type,params,created_at')
        .eq('user_id', uid)
        .eq('chart_type', 'bazi')
        .order('created_at', { ascending: false })
        .limit(30);
      if (err) {
        // table may not exist yet
        console.warn('[chart_saves]', err.message);
        return;
      }
      setSaves((data as SaveRow[]) || []);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadSaves(uid);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadSaves(uid);
      else setSaves([]);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSaves]);

  const runChart = useCallback(() => {
    setError(null);
    setSaveMsg(null);
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(datetime);
    if (!m) {
      setError(t('tools.bazi.invalidTime'));
      return;
    }
    try {
      const result = chartBazi({
        year: Number(m[1]),
        month: Number(m[2]),
        day: Number(m[3]),
        hour: Number(m[4]),
        minute: Number(m[5]),
        gender,
        ziMode,
        useTrueSolarTime: useTrueSolar,
        longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
        pdy,
      });
      setChart(result);
    } catch (e) {
      console.error(e);
      setError(t('tools.bazi.calcFailed'));
    }
  }, [datetime, gender, ziMode, useTrueSolar, longitude, pdy, t]);

  useEffect(() => {
    runChart();
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paramsPayload = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(datetime);
    if (!m) return null;
    return {
      year: Number(m[1]),
      month: Number(m[2]),
      day: Number(m[3]),
      hour: Number(m[4]),
      minute: Number(m[5]),
      gender,
      ziMode,
      useTrueSolarTime: useTrueSolar,
      longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
      pdy,
    };
  }, [datetime, gender, ziMode, useTrueSolar, longitude, pdy]);

  const handleSave = async () => {
    if (!userId || !paramsPayload) {
      setSaveMsg(t('tools.bazi.loginToSave'));
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const title =
        saveTitle.trim() ||
        `${paramsPayload.year}-${String(paramsPayload.month).padStart(2, '0')}-${String(paramsPayload.day).padStart(2, '0')} ${String(paramsPayload.hour).padStart(2, '0')}:${String(paramsPayload.minute).padStart(2, '0')}`;
      const { error: err } = await supabase.from('chart_saves').insert({
        user_id: userId,
        chart_type: 'bazi',
        title,
        params: paramsPayload,
      });
      if (err) throw err;
      setSaveMsg(t('tools.bazi.saveOk'));
      setSaveTitle('');
      await loadSaves(userId);
    } catch (e) {
      console.error(e);
      setSaveMsg(t('tools.bazi.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const loadSave = (row: SaveRow) => {
    const p = row.params;
    setDatetime(
      `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}T${String(p.hour).padStart(2, '0')}:${String(p.minute ?? 0).padStart(2, '0')}`
    );
    setGender(p.gender);
    setZiMode(p.ziMode || 'late');
    setUseTrueSolar(Boolean(p.useTrueSolarTime));
    if (p.longitude) setLongitude(String(p.longitude));
    setPdy(Boolean(p.pdy));
    // recalculate next tick
    setTimeout(() => {
      try {
        setChart(
          chartBazi({
            year: p.year,
            month: p.month,
            day: p.day,
            hour: p.hour,
            minute: p.minute ?? 0,
            gender: p.gender,
            ziMode: p.ziMode || 'late',
            useTrueSolarTime: Boolean(p.useTrueSolarTime),
            longitude: p.longitude,
            pdy: Boolean(p.pdy),
          })
        );
      } catch {
        /* ignore */
      }
    }, 0);
  };

  const deleteSave = async (id: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('chart_saves').delete().eq('id', id).eq('user_id', userId);
    await loadSaves(userId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href={withLocale(locale, '/tools')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF6F61]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('tools.title')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mt-2">
          {t('tools.bazi.title')}
        </h1>
        <p className="text-gray-600 mt-1 max-w-2xl">{t('tools.bazi.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Form */}
        <section className="rounded-2xl bg-white border border-[#f0ece3] p-5 md:p-6 space-y-4 h-fit">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">{t('tools.bazi.birthTime')}</span>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30"
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-gray-500">{t('tools.bazi.gender')}</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-xl py-2 text-sm font-semibold border ${
                    gender === g
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t(`tools.bazi.gender.${g}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500">{t('tools.bazi.ziMode')}</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['late', 'early'] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZiMode(z)}
                  className={`rounded-xl py-2 text-sm font-semibold border ${
                    ziMode === z
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t(`tools.bazi.zi.${z}`)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={useTrueSolar}
              onChange={(e) => setUseTrueSolar(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t('tools.bazi.trueSolar')}
          </label>
          {useTrueSolar && (
            <label className="block">
              <span className="text-xs font-semibold text-gray-500">{t('tools.bazi.longitude')}</span>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={pdy}
              onChange={(e) => setPdy(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t('tools.bazi.pdy')}
          </label>

          <button
            type="button"
            onClick={runChart}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6F61] text-white font-bold py-3 hover:bg-[#ff5a4a] transition-colors"
          >
            <Calculator className="w-4 h-4" />
            {t('tools.bazi.calculate')}
          </button>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          {/* Save */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500">{t('tools.bazi.saves')}</div>
            {userId ? (
              <>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={t('tools.bazi.saveTitlePh')}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 font-semibold py-2.5 text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4" />
                  )}
                  {t('tools.bazi.save')}
                </button>
              </>
            ) : (
              <Link
                href={withLocale(locale, '/user/login')}
                className="block text-center text-sm text-[#FF6F61] font-medium"
              >
                {t('tools.bazi.loginToSave')}
              </Link>
            )}
            {saveMsg && <p className="text-xs text-gray-500">{saveMsg}</p>}

            {saves.length > 0 && (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {saves.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1.5 text-xs"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left hover:text-[#FF6F61] truncate"
                      onClick={() => loadSave(s)}
                    >
                      {s.title || s.created_at}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSave(s.id)}
                      className="p-1 text-gray-400 hover:text-rose-500"
                      aria-label="delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Result */}
        <section className="space-y-4">
          {chart && (
            <>
              <div className="result-hero rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <span aria-hidden className="result-hero-glyph">八</span>
                <div className="text-xs tracking-[0.2em] text-stone-400 tabular-nums">
                  {chart.meta.usedDatetime}
                </div>
                <div className="font-display text-3xl md:text-4xl tracking-[0.15em] mt-3">
                  {chart.formatted}
                </div>
                <div className="mt-4 pt-4 border-t border-[#efe8dc] text-sm text-stone-500 flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    {t('tools.bazi.zodiac')}: {chart.zodiac}
                  </span>
                  <span>
                    {t('tools.bazi.xunKong')}: {chart.xunKong.join('')}
                  </span>
                  <span>
                    {t('tools.bazi.xunShou')}: {chart.xunShou}
                  </span>
                  <span>
                    {t('tools.bazi.direction')}: {chart.daYun.directionLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 md:gap-3">
                <PillarColumn title={t('tools.bazi.year')} pillar={chart.siZhu.year} />
                <PillarColumn title={t('tools.bazi.month')} pillar={chart.siZhu.month} />
                <PillarColumn title={t('tools.bazi.day')} pillar={chart.siZhu.day} highlightDay />
                <PillarColumn title={t('tools.bazi.hour')} pillar={chart.siZhu.hour} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white border border-[#f0ece3] p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('tools.bazi.terms')}</h3>
                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">{t('tools.bazi.prevJie')}</dt>
                      <dd className="font-medium text-right">
                        {chart.meta.prevJie.name} {chart.meta.prevJie.time}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">{t('tools.bazi.nextJie')}</dt>
                      <dd className="font-medium text-right">
                        {chart.meta.nextJie.name} {chart.meta.nextJie.time}
                      </dd>
                    </div>
                    {chart.meta.liChun && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">{t('tools.bazi.lichun')}</dt>
                        <dd className="font-medium text-right">{chart.meta.liChun.time}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-2xl bg-white border border-[#f0ece3] p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('tools.bazi.siLing')}</h3>
                  <p className="font-display text-3xl text-[#FF6F61]">
                    {chart.siLing.gan}{' '}
                    <span className="text-base font-semibold text-gray-600">
                      {chart.siLing.shiShen}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{chart.siLing.segmentLabel}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('tools.bazi.dayInJie')}: {chart.siLing.dayInJie}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#f0ece3] p-6">
                <h3 className="font-semibold text-gray-900 mb-1">{t('tools.bazi.daYun')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {chart.daYun.qiyunDesc} · {t('tools.bazi.qiyunDate')}: {chart.daYun.qiyunDate}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                        <th className="py-2 pr-2">#</th>
                        <th className="py-2 pr-2">{t('tools.bazi.ganZhi')}</th>
                        <th className="py-2 pr-2">{t('tools.bazi.shiShen')}</th>
                        <th className="py-2 pr-2">{t('tools.bazi.naYin')}</th>
                        <th className="py-2 pr-2">{t('tools.bazi.ageRange')}</th>
                        <th className="py-2 pr-2">{t('tools.bazi.jiaoYun')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chart.daYun.cycles.map((c) => (
                        <tr key={c.index} className="border-b border-gray-50">
                          <td className="py-2.5 pr-2 text-gray-400">{c.index + 1}</td>
                          <td className="py-2.5 pr-2 font-display text-base tracking-wider">{c.ganZhi}</td>
                          <td className="py-2.5 pr-2">{c.shiShenOnGan}</td>
                          <td className="py-2.5 pr-2 text-gray-500">{c.naYin}</td>
                          <td className="py-2.5 pr-2">
                            {c.startAge}–{c.endAge}
                          </td>
                          <td className="py-2.5 pr-2">{c.jiaoYunDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-gray-400 px-1">{chart.meta.engineNote}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
