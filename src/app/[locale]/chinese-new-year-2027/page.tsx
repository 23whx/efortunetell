import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import YearFeature from '@/components/zodiac/YearFeature';
import { absoluteUrl } from '@/lib/i18n/seo';

const PATH = '/chinese-new-year-2027';
const TITLE = 'Chinese New Year 2027: Date, Year of the Fire Goat and Traditions';
const DESCRIPTION =
  'Chinese New Year 2027 falls on Saturday, February 6, 2027 and starts the Year of the Fire Goat (Ding Wei), which lasts until January 25, 2028. Dates, traditions, and the Tai Sui outlook for every sign.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('en', PATH) },
  openGraph: { type: 'article', title: TITLE, description: DESCRIPTION, url: absoluteUrl('en', PATH) },
};

export default async function ChineseNewYear2027({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'en') permanentRedirect(`/en${PATH}`);
  return (
    <YearFeature
      year={2027}
      path={PATH}
      title="Chinese New Year 2027: the Year of the Fire Goat"
      intro="Chinese New Year 2027 falls on Saturday, February 6, 2027. It begins the Year of the Fire Goat, Ding Wei (丁未), which runs until January 25, 2028."
      sections={[
        {
          h: 'Key dates',
          p: [
            'New Year’s Eve, the night of the family reunion dinner, is Friday, February 5, 2027. The festival traditionally lasts 15 days and ends with the Lantern Festival on Saturday, February 20, 2027.',
            'Li Chun, the Start of Spring, comes two days earlier. Chinese astrology (BaZi) starts the new year pillar at Li Chun, so babies born between Li Chun (February 4, 09:46 China time) and New Year’s Eve are Fire Goats in BaZi while their popular sign is still the Fire Horse.',
          ],
        },
        {
          h: 'What the Fire Goat means',
          p: [
            'Ding is yin fire, the gentle fire of a candle or lamp, and Wei, the Goat (also called the Sheep or Ram), is a warm earth sign that stores fire. After the intensity of the 2026 Fire Horse, commentators generally expect a softer year that rewards creativity, care for others and steady work over bold moves.',
          ],
        },
        {
          h: 'Traditions',
          p: [
            'Before the new year families clean the house to sweep away bad luck, settle debts and put up red decorations and couplets. On New Year’s Eve they gather for the reunion dinner, and on New Year’s Day children and unmarried adults receive red envelopes of money. Firecrackers, lion dances and visits to relatives fill the first days, and the common greetings are "Xin Nian Kuai Le" in Mandarin and "Gong Hei Fat Choy" in Cantonese.',
          ],
        },
      ]}
      sources={[
        ['https://www.farmersalmanac.com/when-chinese-new-year', 'Farmers’ Almanac: when is Chinese New Year'],
        ['https://www.examinechina.com/chinese-new-year-2027/', 'ExamineChina: Chinese New Year 2027 dates and traditions'],
        ['/en/chinese-zodiac/2027', '2027 Chinese zodiac year facts'],
      ]}
    />
  );
}
