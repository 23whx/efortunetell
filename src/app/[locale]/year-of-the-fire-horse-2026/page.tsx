import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import YearFeature from '@/components/zodiac/YearFeature';
import { absoluteUrl } from '@/lib/i18n/seo';

const PATH = '/year-of-the-fire-horse-2026';
const TITLE = 'Year of the Fire Horse 2026: Meaning, Dates and Outlook for Every Sign';
const DESCRIPTION =
  '2026 is the Year of the Fire Horse (Bing Wu), from February 17, 2026 to February 5, 2027. What the Fire Horse means, the 1966 Japanese superstition, feng shui directions for 2026, and the Tai Sui outlook for all 12 signs.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('en', PATH) },
  openGraph: { type: 'article', title: TITLE, description: DESCRIPTION, url: absoluteUrl('en', PATH) },
};

export default async function FireHorse2026({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'en') permanentRedirect(`/en${PATH}`);
  return (
    <YearFeature
      year={2026}
      path={PATH}
      title="Year of the Fire Horse 2026"
      intro="The Lunar New Year on February 17, 2026 opened the Year of the Fire Horse, Bing Wu (丙午) in the stem-branch calendar. It is the first Fire Horse year since 1966 and the next will be 2086."
      sections={[
        {
          h: 'What "Fire Horse" means',
          p: [
            'Every year pairs a heavenly stem with an earthly branch. In 2026 the stem is Bing, yang fire, and the branch is Wu, the Horse, which is itself a fire sign. Fire sitting on fire makes Bing Wu one of the most intense combinations in the 60-year cycle.',
            'Most commentators describe the year in the same terms: fast, bold and visible. Fire favours action, publicity, technology and bold launches, and it punishes impatience. The usual advice is to channel the energy into clear goals and to cool down before big decisions.',
          ],
        },
        {
          h: 'The 1966 Fire Horse superstition',
          p: [
            'In Japan the Fire Horse, hinoeuma, was long believed to produce headstrong daughters who would bring misfortune to their husbands. In 1966 the number of births in Japan fell by about a quarter compared with the year before, one of the best-documented examples of a superstition changing behaviour. Few people take the belief seriously today, and the 2026 reaction has been mild by comparison.',
          ],
        },
        {
          h: 'Feng shui for 2026',
          p: [
            'Tai Sui, the year deity, sits in the South (the Horse direction) and the Sui Po, the opposite point, in the North. Traditional advice is not to start major renovation or digging in those directions during the year.',
            'The Three Killings (San Sha) fall in the North for a Horse year, and in the annual flying stars the White One star occupies the centre while the Five Yellow star, the most avoided, moves to the South. Many practitioners therefore treat the South as the direction to keep quiet in 2026.',
          ],
        },
        {
          h: 'BaZi uses Li Chun, not the Lunar New Year',
          p: [
            'For Chinese astrology the Fire Horse year pillar began at Li Chun, the Start of Spring, on February 4, 2026 at 04:02 China time. Someone born on February 10, 2026 is a Fire Horse in BaZi but, by the popular count, a Wood Snake. The zodiac calculator shows both.',
          ],
        },
      ]}
      sources={[
        ['https://www.scmp.com/lifestyle/chinese-zodiac/article/3342508/how-rabbits-can-avoid-bad-luck-year-horse-2026-amid-clash-tai-sui', 'South China Morning Post: Rabbits and Tai Sui in 2026'],
        ['https://abc17news.com/entertainment/cnn-style/2026/02/16/chinese-zodiac-predictions-whats-in-store-for-2026-as-we-enter-the-year-of-the-fire-horse/', 'CNN Style: Chinese zodiac predictions for the Year of the Fire Horse'],
        ['https://www.fetechinoise.ca/blog/2026/zodiac-predictions', 'Fête Chinoise: 2026 Fire Horse zodiac predictions'],
        ['/en/chinese-zodiac/2026', '2026 Chinese zodiac year facts'],
      ]}
    />
  );
}
