'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Solar } from 'lunar-javascript';
import { fourPillarsFromLunar } from '@/lib/paipan/calendar';
import { ANIMALS, ELEMENTS, STEMS } from '@/lib/zodiac/data';

function animalOf(branch: string) {
  return ANIMALS.find((a) => a.branch === branch)!;
}

/** Find your Chinese zodiac sign by birth date, by Lunar New Year (popular) and by Li Chun (BaZi). */
export default function ZodiacCalculator() {
  const [date, setDate] = useState('1990-02-10');
  const [time, setTime] = useState('12:00');

  const result = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) return null;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (y < 1901 || y > 2099) return null;
    const [hh, mm] = (time || '12:00').split(':').map(Number);
    const lunar = Solar.fromYmdHms(y, mo, d, hh || 0, mm || 0, 0).getLunar() as unknown as {
      getYear: () => number;
      getYearInGanZhi: () => string;
    };
    // Lunar-new-year based (the common "what year were you born in")
    const lnyGz = lunar.getYearInGanZhi();
    const lnyYear = lunar.getYear();
    // Li Chun based (BaZi year pillar, exact to the minute)
    const bazi = fourPillarsFromLunar(new Date(y, mo - 1, d, hh || 0, mm || 0), 'late').year.ganZhi;
    return {
      lny: { gz: lnyGz, year: lnyYear, animal: animalOf(lnyGz[1]), element: ELEMENTS[STEMS[lnyGz[0]].element] },
      lc: { gz: bazi, animal: animalOf(bazi[1]), element: ELEMENTS[STEMS[bazi[0]].element] },
    };
  }, [date, time]);

  return (
    <div className="result-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Date of birth
          <input
            type="date"
            min="1901-01-01"
            max="2099-12-31"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-[#e6ddcd] bg-white px-4 py-2.5 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/40"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-700">
          Time (optional)
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-[#e6ddcd] bg-white px-4 py-2.5 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/40"
          />
        </label>
      </div>

      {result ? (
        <div className="mt-6" aria-live="polite">
          <p className="text-stone-500 text-sm">Your Chinese zodiac sign is</p>
          <p className="mt-1 font-display text-3xl md:text-4xl font-bold text-stone-900">
            {result.lny.element.name} {result.lny.animal.name}{' '}
            <span className="text-stone-400 text-2xl">{result.lny.gz}</span>
          </p>
          <p className="mt-2 text-sm text-stone-600">
            Based on the Lunar New Year.{' '}
            <Link href={`/en/chinese-zodiac/${result.lny.year}`} className="text-[#c2483c] font-medium hover:underline underline-offset-2">
              See the {result.lny.year} zodiac year
            </Link>
          </p>
          {result.lc.gz !== result.lny.gz && (
            <p className="mt-4 rounded-xl bg-[#fff4f1] px-4 py-3 text-sm text-stone-700">
              Your birthday falls between the Lunar New Year and Li Chun. BaZi starts the year at Li Chun, so
              your BaZi year pillar is <strong>{result.lc.gz}</strong>, the {result.lc.element.name} {result.lc.animal.name}.
            </p>
          )}
          <Link
            href="/en/tools/bazi"
            className="mt-6 inline-flex items-center rounded-xl bg-[#FF6F61] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#f25d4f] active:scale-[0.98] transition"
          >
            Get your full BaZi chart
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-sm text-stone-500">Enter a date between 1901 and 2099.</p>
      )}
    </div>
  );
}
