'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookmarkPlus,
  Compass,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { withLocale } from '@/lib/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ZiMode } from '@/lib/paipan/bazi';
import {
  chartYinpanQimen,
  GRID_LAYOUT,
  type QimenChart,
  type QimenMethod,
} from '@/lib/paipan/qimen';
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
    ziMode: ZiMode;
    useTrueSolarTime: boolean;
    longitude?: number;
    method: QimenMethod;
  };
  created_at: string;
};

const TRIGRAM: Record<string, string> = {
  坎: '☵', 坤: '☷', 震: '☳', 巽: '☴', 中: '', 乾: '☰', 兑: '☱', 艮: '☶', 离: '☲',
};

/** 吉门（开休生）、凶门（死惊伤）、中平（杜景） */
const DOOR_TONE: Record<string, string> = {
  开: 'text-emerald-700', 休: 'text-emerald-700', 生: 'text-emerald-700',
  死: 'text-rose-700', 惊: 'text-rose-700', 伤: 'text-rose-700',
  杜: 'text-stone-600', 景: 'text-stone-600',
};

function PalaceCell({
  palace,
  chart,
}: {
  palace: number;
  chart: QimenChart;
}) {
  const cell = chart.byPalace[palace];
  if (!cell) return null;
  const isFu = cell.shen === '值符';
  const isShi = palace !== 5 && cell.men === chart.meta.zhiShi;
  return (
    <div
      className={[
        'relative rounded-xl border p-2 md:p-3 min-h-[124px] md:aspect-square flex flex-col transition-colors',
        palace === 5
          ? 'bg-[#f6f1e7] border-[#e9e1d0]'
          : isFu
            ? 'bg-[#fff4f1] border-[#FF6F61]/50'
            : cell.kongWang
              ? 'bg-stone-50 border-stone-200'
              : 'bg-white border-[#efe8dc]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between text-[10px] text-stone-400 leading-none">
        <span className="tabular-nums">
          <span className="text-sm text-stone-500 mr-0.5" aria-hidden>{TRIGRAM[cell.bagua]}</span>
          {cell.bagua}
          {palace}
        </span>
        <span className="flex gap-1">
          {isFu && <span className="px-1 py-0.5 rounded bg-[#FF6F61] text-white text-[9px] font-semibold">符</span>}
          {isShi && <span className="px-1 py-0.5 rounded bg-stone-800 text-white text-[9px] font-semibold">使</span>}
        </span>
      </div>
      <div className="mt-1.5 space-y-0.5 leading-tight">
        <div className="text-[13px] md:text-sm text-stone-500">{cell.shen || ' '}</div>
        <div className="text-sm md:text-base font-semibold text-stone-900 font-display">{cell.star || '—'}</div>
        {cell.men && (
          <div className={`text-sm md:text-base font-semibold font-display ${DOOR_TONE[cell.men] || 'text-stone-900'}`}>
            {cell.men}门
          </div>
        )}
      </div>
      <div className="mt-auto flex flex-col items-end gap-0.5 text-[11px] tabular-nums">
        {palace !== 5 && (
          <div>
            <span className="text-stone-400">天</span>{' '}
            <span className="font-bold text-stone-900">{cell.tianPanGan || '—'}</span>
            {cell.qinGan && <span className="font-bold text-stone-500">{cell.qinGan}</span>}
          </div>
        )}
        <div>
          <span className="text-stone-400">地</span>{' '}
          <span className="font-bold text-stone-700">{cell.diPanGan || '—'}</span>
        </div>
      </div>
      {(cell.maXing || cell.kongWang || cell.ruMu || cell.jiXing || cell.menPo) && (
        <div className="absolute bottom-1 left-1.5 flex gap-0.5 text-[9px]">
          {cell.jiXing && (
            <span className="px-1 rounded bg-rose-100 text-rose-700">刑</span>
          )}
          {cell.ruMu && (
            <span className="px-1 rounded bg-stone-200 text-stone-700">墓</span>
          )}
          {cell.menPo && (
            <span className="px-1 rounded bg-orange-100 text-orange-700">迫</span>
          )}
          {cell.kongWang && (
            <span className="px-1 rounded bg-gray-200 text-gray-600">空</span>
          )}
          {cell.maXing && (
            <span className="px-1 rounded bg-amber-200 text-amber-900">马</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function QimenClient({ locale }: { locale: Locale }) {
  const { t } = useLanguage();
  const [datetime, setDatetime] = useState('2024-06-01T09:00');
  const [ziMode, setZiMode] = useState<ZiMode>('late');
  const [useTrueSolar, setUseTrueSolar] = useState(false);
  const [longitude, setLongitude] = useState('116.4');
  const [method, setMethod] = useState<QimenMethod>('yinpan');
  const [chart, setChart] = useState<QimenChart | null>(null);
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
        .eq('chart_type', 'qimen')
        .order('created_at', { ascending: false })
        .limit(30);
      if (err) {
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
      setError(t('tools.qimen.invalidTime'));
      return;
    }
    try {
      setChart(
        chartYinpanQimen({
          year: Number(m[1]),
          month: Number(m[2]),
          day: Number(m[3]),
          hour: Number(m[4]),
          minute: Number(m[5]),
          ziMode,
          useTrueSolarTime: useTrueSolar,
          longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
          method,
        })
      );
    } catch (e) {
      console.error(e);
      setError(t('tools.qimen.calcFailed'));
    }
  }, [datetime, ziMode, useTrueSolar, longitude, method, t]);

  useEffect(() => {
    runChart();
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
      ziMode,
      useTrueSolarTime: useTrueSolar,
      longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
      method,
    };
  }, [datetime, ziMode, useTrueSolar, longitude, method]);

  const handleSave = async () => {
    if (!userId || !paramsPayload) {
      setSaveMsg(t('tools.qimen.loginToSave'));
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
        chart_type: 'qimen',
        title,
        params: paramsPayload,
      });
      if (err) throw err;
      setSaveMsg(t('tools.qimen.saveOk'));
      setSaveTitle('');
      await loadSaves(userId);
    } catch (e) {
      console.error(e);
      setSaveMsg(t('tools.qimen.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const loadSave = (row: SaveRow) => {
    const p = row.params;
    setDatetime(
      `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}T${String(p.hour).padStart(2, '0')}:${String(p.minute ?? 0).padStart(2, '0')}`
    );
    setZiMode(p.ziMode || 'late');
    setUseTrueSolar(Boolean(p.useTrueSolarTime));
    if (p.longitude) setLongitude(String(p.longitude));
    setMethod(p.method === 'chaibu' ? 'chaibu' : 'yinpan');
    setTimeout(() => {
      try {
        setChart(
          chartYinpanQimen({
            year: p.year,
            month: p.month,
            day: p.day,
            hour: p.hour,
            minute: p.minute ?? 0,
            ziMode: p.ziMode || 'late',
            useTrueSolarTime: Boolean(p.useTrueSolarTime),
            longitude: p.longitude,
            method: p.method === 'chaibu' ? 'chaibu' : 'yinpan',
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
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
          {t('tools.qimen.title')}
        </h1>
        <p className="text-gray-600 mt-1 max-w-2xl">{t('tools.qimen.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <section className="rounded-2xl bg-white border border-[#f0ece3] shadow-sm p-5 space-y-4 h-fit">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.qimen.datetime')}
            </span>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30"
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.qimen.ziMode')}
            </span>
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

          <div>
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.qimen.method')}
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['yinpan', 'chaibu'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-xl py-2 text-sm font-semibold border ${
                    method === m
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t(`tools.qimen.method.${m}`)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              {t('tools.qimen.methodHint')}
            </p>
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
              <span className="text-xs font-semibold text-gray-500">
                {t('tools.bazi.longitude')}
              </span>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          )}

          <button
            type="button"
            onClick={runChart}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6F61] text-white font-bold py-3 hover:bg-[#ff5a4a] transition-colors"
          >
            <Compass className="w-4 h-4" />
            {t('tools.qimen.calculate')}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500">
              {t('tools.qimen.saves')}
            </div>
            {userId ? (
              <>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={t('tools.qimen.saveTitlePh')}
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
                  {t('tools.qimen.save')}
                </button>
              </>
            ) : (
              <Link
                href={withLocale(locale, '/user/login')}
                className="block text-center text-sm text-[#FF6F61] font-medium"
              >
                {t('tools.qimen.loginToSave')}
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
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="space-y-4">
          {chart && (
            <>
              <div className="result-hero rounded-2xl p-6 md:p-8 relative overflow-hidden">
                <span aria-hidden className="result-hero-glyph">奇</span>
                <div className="text-xs tracking-[0.2em] text-stone-400 tabular-nums">{chart.meta.usedDatetime}</div>
                <div className="font-display text-2xl md:text-3xl mt-3">
                  {chart.meta.dunLabel}
                  {chart.meta.juShu}
                  {t('tools.qimen.ju')} · {chart.meta.yuanLabel && <>{chart.meta.yuanLabel} · </>}
                  {t('tools.qimen.method.' + chart.meta.method)}
                </div>
                <div className="mt-4 pt-4 border-t border-[#efe8dc] text-sm text-stone-500 flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    {t('tools.qimen.jieQi')}: {chart.meta.jieQi}
                  </span>
                  <span>
                    {t('tools.qimen.xunShou')}: {chart.meta.xunShou}
                    {chart.meta.xunShouYi}
                  </span>
                  <span>
                    {t('tools.qimen.zhiFu')}: {chart.meta.zhiFu}
                  </span>
                  <span>
                    {t('tools.qimen.zhiShi')}: {chart.meta.zhiShi}门
                  </span>
                  <span>
                    {t('tools.qimen.kongWang')}: {chart.meta.kongWang.join('')}
                  </span>
                  <span>
                    {t('tools.qimen.ma')}: {chart.meta.maZhi}
                  </span>
                  {chart.meta.shiGanZuoMu && (
                    <span className="text-[#c2483c] font-semibold">时干自坐墓</span>
                  )}
                </div>
                <div className="mt-3 font-display text-lg tracking-[0.15em] text-stone-800">
                  {chart.meta.siZhu.year} {chart.meta.siZhu.month}{' '}
                  {chart.meta.siZhu.day} {chart.meta.siZhu.hour}
                </div>
              </div>

              {/* 九宫 4 9 2 / 3 5 7 / 8 1 6 */}
              <div className="rounded-2xl bg-white/80 border border-[#f0ece3] p-3 md:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-gray-900">
                    {t('tools.qimen.grid')}
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    {t('tools.qimen.gridHint')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-xl mx-auto">
                  {GRID_LAYOUT.flat().map((p) => (
                    <PalaceCell key={p} palace={p} chart={chart} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">{t('tools.qimen.jieRange')}: </span>
                  {chart.meta.jieStart} → {chart.meta.jieEnd}
                </p>
                <p className="text-xs text-gray-400 pt-2">{chart.meta.note}</p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
