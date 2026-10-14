'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, Search, Sparkles, Wand2 } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { withLocale } from '@/lib/i18n/config';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  generateNames,
  getHanzi,
  listByKangxi,
  listByStructure,
  listByWuxing,
  STRUCTURES,
  WUXING_LIST,
  type Gender,
  type GeneratedName,
  type HanziRecord,
  type XiYongResult,
} from '@/lib/paipan/naming';

type Tab = 'generate' | 'lookup';

export default function NamingClient({ locale }: { locale: Locale }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('generate');

  // generate
  const [surname, setSurname] = useState('李');
  const [gender, setGender] = useState<Gender>('male');
  const [datetime, setDatetime] = useState('1990-05-15T10:30');
  const [xiYong, setXiYong] = useState<XiYongResult | null>(null);
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [genError, setGenError] = useState<string | null>(null);

  // lookup
  const [query, setQuery] = useState('王');
  const [detail, setDetail] = useState<HanziRecord | null>(() => getHanzi('王'));
  const [browseWx, setBrowseWx] = useState<string>('木');
  const [browseList, setBrowseList] = useState<HanziRecord[]>(() =>
    listByWuxing('木', 48)
  );

  const runGenerate = useCallback(() => {
    setGenError(null);
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(datetime);
    if (!m || !surname.trim()) {
      setGenError(t('tools.naming.invalidInput'));
      return;
    }
    try {
      const res = generateNames({
        surname: surname.trim(),
        gender,
        year: Number(m[1]),
        month: Number(m[2]),
        day: Number(m[3]),
        hour: Number(m[4]),
        minute: Number(m[5]),
        count: 3,
      });
      setXiYong(res.xiYong);
      setNames(res.names);
    } catch (e) {
      console.error(e);
      setGenError(t('tools.naming.genFailed'));
    }
  }, [datetime, surname, gender, t]);

  const doLookup = (ch: string) => {
    const c = ch.trim().slice(0, 1);
    setQuery(c);
    setDetail(getHanzi(c));
  };

  const browse = useMemo(
    () => ({
      byWx: (wx: string) => {
        setBrowseWx(wx);
        setBrowseList(listByWuxing(wx, 48));
      },
      byKangxi: (n: number) => {
        setBrowseWx(`kx-${n}`);
        setBrowseList(listByKangxi(n, 48));
      },
      byStruct: (s: string) => {
        setBrowseWx(`st-${s}`);
        setBrowseList(listByStructure(s, 48));
      },
    }),
    []
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href={withLocale(locale, '/tools')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF6F61]"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('tools.title')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
          {t('tools.naming.title')}
        </h1>
        <p className="text-gray-600 mt-1 max-w-2xl">{t('tools.naming.subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(
          [
            ['generate', t('tools.naming.tabGen'), Wand2],
            ['lookup', t('tools.naming.tabLookup'), Search],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border transition-colors ${
              tab === id
                ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <section className="rounded-2xl bg-white border border-[#f0ece3] shadow-sm p-5 space-y-4 h-fit">
            <label className="block">
              <span className="text-xs font-semibold text-gray-500">
                {t('tools.naming.surname')}
              </span>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="李 / 欧阳"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                {t('tools.naming.surnameHint')}
              </span>
            </label>

            <div>
              <span className="text-xs font-semibold text-gray-500">
                {t('tools.naming.gender')}
              </span>
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

            <label className="block">
              <span className="text-xs font-semibold text-gray-500">
                {t('tools.naming.birthTime')}
              </span>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
            </label>

            <button
              type="button"
              onClick={runGenerate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF6F61] text-white font-bold py-3"
            >
              <Sparkles className="w-4 h-4" />
              {t('tools.naming.generate')}
            </button>
            {genError && <p className="text-sm text-rose-600">{genError}</p>}
          </section>

          <section className="space-y-4">
            {xiYong && (
              <div className="rounded-2xl bg-[#221d17] text-white p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#FF6F61] to-[#ffb347]" />
                <div className="text-sm text-white/70">
                  {t('tools.naming.dayMaster')}:{' '}
                  <span className="font-display text-lg text-white">{xiYong.dayMaster}</span>（
                  {xiYong.dayMasterWx}）
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/70">
                  <span>
                    {t('tools.naming.xi')}:{' '}
                    <strong className="tracking-widest">{xiYong.xi.join(' ')}</strong>
                  </span>
                  <span>
                    {t('tools.naming.ji')}:{' '}
                    <strong className="tracking-widest">{xiYong.ji.join(' ')}</strong>
                  </span>
                </div>
                <p className="text-xs opacity-80 mt-2">{xiYong.note}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {WUXING_LIST.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-1 rounded-lg bg-white/15"
                    >
                      {w} {xiYong.counts[w]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {names.length > 0 && (
              <div className="grid gap-3">
                {names.map((n, i) => (
                  <div
                    key={n.given}
                    className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="font-display text-3xl tracking-[0.15em] text-gray-900 min-w-[8rem]">
                      <span className="text-[#FF6F61] text-base mr-2 font-sans font-medium">#{i + 1}</span>
                      {n.fullName}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {n.chars.map((c) => (
                          <button
                            key={c.char}
                            type="button"
                            onClick={() => {
                              setTab('lookup');
                              doLookup(c.char);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-50 border border-[#f0ece3] text-sm"
                          >
                            <span className="font-bold text-lg">{c.char}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              {c.wuxing}·{c.kangxi}
                              {t('tools.naming.strokes')}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{n.reason}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {t('tools.naming.score')} {n.score}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!names.length && !xiYong && (
              <div className="rounded-2xl border border-dashed border-amber-200 p-10 text-center text-gray-400 text-sm">
                {t('tools.naming.emptyGen')}
              </div>
            )}

            <p className="text-xs text-gray-400">{t('tools.naming.disclaimer')}</p>
          </section>
        </div>
      )}

      {tab === 'lookup' && (
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
          <section className="space-y-4">
            <div className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm">
              <label className="block">
                <span className="text-xs font-semibold text-gray-500">
                  {t('tools.naming.lookupChar')}
                </span>
                <div className="mt-1 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={2}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => doLookup(query)}
                    className="px-4 rounded-xl bg-[#FF6F61] text-white font-bold"
                  >
                    {t('tools.naming.lookup')}
                  </button>
                </div>
              </label>

              {detail ? (
                <div className="mt-5">
                  <div className="text-6xl font-black text-center text-gray-900 mb-4">
                    {detail.char}
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {(
                      [
                        ['wuxing', detail.wuxing],
                        ['kangxi', `${detail.kangxi}`],
                        ['modern', `${detail.modern}`],
                        ['radical', detail.radical],
                        ['structure', detail.structure],
                      ] as const
                    ).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-2 rounded-xl bg-amber-50/60 px-3 py-2"
                      >
                        <dt className="text-gray-500">
                          {t(`tools.naming.field.${k}`)}
                        </dt>
                        <dd className="font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={withLocale(locale, `/tools/hanzi/${encodeURIComponent(detail.char)}`)}
                    className="mt-4 inline-block text-sm text-[#FF6F61] font-medium"
                  >
                    {t('tools.naming.permalink')} →
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400 text-center">
                  {t('tools.naming.notFound')}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white border border-[#f0ece3] p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">
              {t('tools.naming.browse')}
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {WUXING_LIST.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => browse.byWx(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    browseWx === w
                      ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {[5, 8, 10, 12, 15].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => browse.byKangxi(n)}
                  className="px-2 py-0.5 rounded text-[11px] border border-gray-100 text-gray-500"
                >
                  {n}
                  {t('tools.naming.strokes')}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mb-4 max-h-16 overflow-y-auto">
              {STRUCTURES.slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => browse.byStruct(s)}
                  className="px-2 py-0.5 rounded text-[10px] border border-gray-100 text-gray-500"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {browseList.map((h) => (
                <button
                  key={h.char}
                  type="button"
                  onClick={() => doLookup(h.char)}
                  className="w-10 h-10 rounded-xl border border-[#f0ece3] hover:border-[#FF6F61] text-lg font-bold"
                  title={`${h.wuxing} ${h.kangxi}`}
                >
                  {h.char}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
