'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookmarkPlus,
  Loader2,
  ScrollText,
  Trash2,
} from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { withLocale } from '@/lib/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  chartDaliuren,
  DI_ZHI,
  type DaliurenChart,
  type GuiType,
  type HuanJiang,
} from '@/lib/paipan/daliuren';
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
    diFen: string;
    huanJiang: HuanJiang;
    guiType: GuiType;
    useTrueSolarTime: boolean;
    longitude?: number;
  };
  created_at: string;
};

function WeiCard({
  title,
  gan,
  zhi,
  name,
  wx,
  wangShuai,
  dong,
  flags,
  highlight,
}: {
  title: string;
  gan: string | null;
  zhi: string | null;
  name: string | null;
  wx: string;
  wangShuai: string;
  dong: string[];
  flags: string[];
  highlight?: boolean;
}) {
  const main =
    gan && zhi ? `${gan}${zhi}` : gan ? gan : zhi ? zhi : '—';
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight
          ? 'border-[#FF6F61] bg-gradient-to-b from-[#FF6F61]/10 to-white'
          : 'border-amber-100 bg-white'
      }`}
    >
      <div className="text-xs font-semibold text-gray-500 mb-2">{title}</div>
      <div className="text-3xl font-black tracking-widest text-gray-900">{main}</div>
      {name && (
        <div className="text-sm font-bold text-[#FF6F61] mt-1">{name}</div>
      )}
      <div className="mt-2 text-xs text-gray-500">
        {wx} · {wangShuai}
      </div>
      {(flags.length > 0 || dong.length > 0) && (
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {flags.map((f) => (
            <span
              key={f}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900"
            >
              {f}
            </span>
          ))}
          {dong.map((d) => (
            <span
              key={d}
              className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700"
            >
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DaliurenClient({ locale }: { locale: Locale }) {
  const { t } = useLanguage();
  const [datetime, setDatetime] = useState('2024-06-01T09:00');
  const [diFen, setDiFen] = useState('子');
  const [huanJiang, setHuanJiang] = useState<HuanJiang>('zhongqi');
  const [guiType, setGuiType] = useState<GuiType>('maoYou');
  const [useTrueSolar, setUseTrueSolar] = useState(false);
  const [longitude, setLongitude] = useState('116.4');
  const [chart, setChart] = useState<DaliurenChart | null>(null);
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
        .eq('chart_type', 'daliuren')
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
      setError(t('tools.daliuren.invalidTime'));
      return;
    }
    try {
      setChart(
        chartDaliuren({
          year: Number(m[1]),
          month: Number(m[2]),
          day: Number(m[3]),
          hour: Number(m[4]),
          minute: Number(m[5]),
          diFen,
          huanJiang,
          guiType,
          useTrueSolarTime: useTrueSolar,
          longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
        })
      );
    } catch (e) {
      console.error(e);
      setError(t('tools.daliuren.calcFailed'));
    }
  }, [datetime, diFen, huanJiang, guiType, useTrueSolar, longitude, t]);

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
      diFen,
      huanJiang,
      guiType,
      useTrueSolarTime: useTrueSolar,
      longitude: useTrueSolar ? Number(longitude) || 120 : undefined,
    };
  }, [datetime, diFen, huanJiang, guiType, useTrueSolar, longitude]);

  const handleSave = async () => {
    if (!userId || !paramsPayload) {
      setSaveMsg(t('tools.daliuren.loginToSave'));
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const title =
        saveTitle.trim() ||
        `${paramsPayload.year}-${String(paramsPayload.month).padStart(2, '0')}-${String(paramsPayload.day).padStart(2, '0')} ${diFen}`;
      const { error: err } = await supabase.from('chart_saves').insert({
        user_id: userId,
        chart_type: 'daliuren',
        title,
        params: paramsPayload,
      });
      if (err) throw err;
      setSaveMsg(t('tools.daliuren.saveOk'));
      setSaveTitle('');
      await loadSaves(userId);
    } catch (e) {
      console.error(e);
      setSaveMsg(t('tools.daliuren.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const loadSave = (row: SaveRow) => {
    const p = row.params;
    setDatetime(
      `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}T${String(p.hour).padStart(2, '0')}:${String(p.minute ?? 0).padStart(2, '0')}`
    );
    setDiFen(p.diFen);
    setHuanJiang(p.huanJiang || 'zhongqi');
    setGuiType(p.guiType || 'maoYou');
    setUseTrueSolar(Boolean(p.useTrueSolarTime));
    if (p.longitude) setLongitude(String(p.longitude));
    setTimeout(() => {
      try {
        setChart(
          chartDaliuren({
            year: p.year,
            month: p.month,
            day: p.day,
            hour: p.hour,
            minute: p.minute ?? 0,
            diFen: p.diFen,
            huanJiang: p.huanJiang,
            guiType: p.guiType,
            useTrueSolarTime: Boolean(p.useTrueSolarTime),
            longitude: p.longitude,
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

  const randomDiFen = () => {
    setDiFen(DI_ZHI[Math.floor(Math.random() * 12)]);
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
          {t('tools.daliuren.title')}
        </h1>
        <p className="text-gray-600 mt-1 max-w-2xl">{t('tools.daliuren.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <section className="rounded-3xl bg-white border border-amber-100 shadow-sm p-5 space-y-4 h-fit">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.daliuren.datetime')}
            </span>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {t('tools.daliuren.diFen')}
              </span>
              <button
                type="button"
                onClick={randomDiFen}
                className="text-[11px] text-[#FF6F61] font-medium"
              >
                {t('tools.daliuren.random')}
              </button>
            </div>
            <div className="mt-1 grid grid-cols-6 gap-1">
              {DI_ZHI.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setDiFen(z)}
                  className={`rounded-lg py-1.5 text-sm font-bold border ${
                    diFen === z
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.daliuren.huanJiang')}
            </span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['zhongqi', 'jiaojie'] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHuanJiang(h)}
                  className={`rounded-xl py-2 text-sm font-semibold border ${
                    huanJiang === h
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t(`tools.daliuren.huan.${h}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500">
              {t('tools.daliuren.guiType')}
            </span>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {(['maoYou', 'day', 'night'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGuiType(g)}
                  className={`rounded-xl py-2 text-xs font-semibold border ${
                    guiType === g
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {t(`tools.daliuren.gui.${g}`)}
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6F61] text-white font-bold py-3"
          >
            <ScrollText className="w-4 h-4" />
            {t('tools.daliuren.calculate')}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500">
              {t('tools.daliuren.saves')}
            </div>
            {userId ? (
              <>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={t('tools.daliuren.saveTitlePh')}
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
                  {t('tools.daliuren.save')}
                </button>
              </>
            ) : (
              <Link
                href={withLocale(locale, '/user/login')}
                className="block text-center text-sm text-[#FF6F61] font-medium"
              >
                {t('tools.daliuren.loginToSave')}
              </Link>
            )}
            {saveMsg && <p className="text-xs text-gray-500">{saveMsg}</p>}
            {saves.length > 0 && (
              <ul className="space-y-1.5 max-h-40 overflow-y-auto">
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
                    <button type="button" onClick={() => deleteSave(s.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-gray-400" />
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
              <div className="rounded-3xl bg-gradient-to-br from-indigo-900 to-amber-700 text-white p-5 md:p-6 shadow-lg">
                <div className="text-sm opacity-90">{chart.meta.usedDatetime}</div>
                <div className="text-xl md:text-2xl font-black mt-1">
                  {t('tools.daliuren.yueJiang')}: {chart.meta.yueJiang}(
                  {chart.meta.yueJiangZhi}) · {chart.meta.huanJiang}
                </div>
                <div className="mt-2 text-sm opacity-90 flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    {t('tools.daliuren.diFen')}: {chart.meta.diFen}
                  </span>
                  <span>
                    {t('tools.daliuren.riKong')}: {chart.meta.riKong}
                  </span>
                  {chart.meta.siDaKongWang && (
                    <span>
                      {t('tools.daliuren.siDa')}: {chart.meta.siDaKongWang}
                    </span>
                  )}
                  <span>
                    {t('tools.daliuren.yong')}: {chart.meta.yongSeatLabel}
                  </span>
                  <span>
                    {t('tools.daliuren.guiType')}: {chart.meta.guiType}
                  </span>
                </div>
                <div className="mt-2 tracking-widest text-sm">
                  {chart.meta.siZhu.year} {chart.meta.siZhu.month}{' '}
                  {chart.meta.siZhu.day} {chart.meta.siZhu.hour}
                </div>
              </div>

              {/* 四位自上而下 */}
              <div className="rounded-3xl bg-white border border-amber-100 p-4 md:p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">
                  {t('tools.daliuren.siWei')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  <WeiCard
                    title={chart.siWei.renYuan.label}
                    gan={chart.siWei.renYuan.gan}
                    zhi={chart.siWei.renYuan.zhi}
                    name={chart.siWei.renYuan.name}
                    wx={chart.siWei.renYuan.wx}
                    wangShuai={chart.siWei.renYuan.wangShuai}
                    dong={chart.siWei.renYuan.dong}
                    flags={chart.siWei.renYuan.flags}
                    highlight={chart.meta.yongSeat === 'renYuan'}
                  />
                  <WeiCard
                    title={chart.siWei.guiShen.label}
                    gan={chart.siWei.guiShen.gan}
                    zhi={chart.siWei.guiShen.zhi}
                    name={chart.siWei.guiShen.name}
                    wx={chart.siWei.guiShen.wx}
                    wangShuai={chart.siWei.guiShen.wangShuai}
                    dong={chart.siWei.guiShen.dong}
                    flags={chart.siWei.guiShen.flags}
                    highlight={chart.meta.yongSeat === 'guiShen'}
                  />
                  <WeiCard
                    title={chart.siWei.jiangShen.label}
                    gan={chart.siWei.jiangShen.gan}
                    zhi={chart.siWei.jiangShen.zhi}
                    name={chart.siWei.jiangShen.name}
                    wx={chart.siWei.jiangShen.wx}
                    wangShuai={chart.siWei.jiangShen.wangShuai}
                    dong={chart.siWei.jiangShen.dong}
                    flags={chart.siWei.jiangShen.flags}
                    highlight={chart.meta.yongSeat === 'jiangShen'}
                  />
                  <WeiCard
                    title={chart.siWei.diFen.label}
                    gan={chart.siWei.diFen.gan}
                    zhi={chart.siWei.diFen.zhi}
                    name={chart.siWei.diFen.name}
                    wx={chart.siWei.diFen.wx}
                    wangShuai={chart.siWei.diFen.wangShuai}
                    dong={chart.siWei.diFen.dong}
                    flags={chart.siWei.diFen.flags}
                    highlight={chart.meta.yongSeat === 'diFen'}
                  />
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                  {t('tools.daliuren.orderHint')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white border border-amber-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {t('tools.daliuren.dong')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(chart.dongFlags)
                      .filter(([, v]) => v)
                      .map(([k]) => (
                        <span
                          key={k}
                          className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold"
                        >
                          {k}
                        </span>
                      ))}
                    {Object.values(chart.dongFlags).every((v) => !v) && (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-white border border-amber-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {t('tools.daliuren.relations')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {chart.relations.length === 0 && (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                    {chart.relations.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 px-1">
                {chart.meta.jieQiRange} · {chart.meta.note}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
