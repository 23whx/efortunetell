/** English glossary content (/en/terms). Names follow the usual English BaZi terminology. */

export const STEM_EN: Record<string, { image: string; nature: string }> = {
  甲: { image: 'a tall tree', nature: 'Upright, principled and pioneering; can be rigid and slow to bend.' },
  乙: { image: 'flowers, grass and vines', nature: 'Gentle, adaptable and diplomatic; resilient by bending rather than resisting.' },
  丙: { image: 'the sun', nature: 'Warm, generous and expressive; energetic but sometimes impatient.' },
  丁: { image: 'a candle or lamp', nature: 'Thoughtful, refined and caring; insightful but sensitive.' },
  戊: { image: 'a mountain or city wall', nature: 'Stable, trustworthy and protective; can be stubborn.' },
  己: { image: 'fertile garden soil', nature: 'Nurturing, practical and accommodating; tends to over-think.' },
  庚: { image: 'raw metal or an axe', nature: 'Decisive, loyal and tough; direct to the point of bluntness.' },
  辛: { image: 'jewellery and fine metal', nature: 'Refined, perceptive and proud; values appearance and quality.' },
  壬: { image: 'the ocean or a great river', nature: 'Intelligent, sociable and free-flowing; can be restless.' },
  癸: { image: 'rain and dew', nature: 'Intuitive, imaginative and quietly persistent; prone to worry.' },
};

export const DIRECTION_EN: Record<string, string> = {
  东方: 'East', 南方: 'South', 西方: 'West', 北方: 'North', 中央: 'Centre',
  正北: 'North', 正东: 'East', 正南: 'South', 正西: 'West',
  东北偏北: 'North-northeast', 东北偏东: 'East-northeast', 东南偏东: 'East-southeast', 东南偏南: 'South-southeast',
  西南偏南: 'South-southwest', 西南偏西: 'West-southwest', 西北偏西: 'West-northwest', 西北偏北: 'North-northwest',
};

export const SEASON_EN: Record<string, string> = { 春: 'Spring', 夏: 'Summer', 秋: 'Autumn', 冬: 'Winter', 四季末: 'Last month of each season' };

export const SHISHEN_EN: Record<string, { en: string; relation: string; traits: string; career: string }> = {
  比肩: { en: 'Friend (Companion)', relation: 'Same element and same polarity as the Day Master.', traits: 'Independence, self-reliance and loyalty to peers; in excess, stubbornness and competition over resources.', career: 'Self-employment, partnerships, sports.' },
  劫财: { en: 'Rob Wealth', relation: 'Same element, opposite polarity.', traits: 'Boldness, sociability and drive; in excess, impulsive spending and rivalry.', career: 'Sales, business development, trading.' },
  食神: { en: 'Eating God', relation: 'The element the Day Master produces, same polarity.', traits: 'Creativity, enjoyment of life and a calm temperament; in excess, complacency.', career: 'Food, arts, teaching, design.' },
  伤官: { en: 'Hurting Officer', relation: 'The element the Day Master produces, opposite polarity.', traits: 'Brilliance, eloquence and originality; in excess, rebellion against rules.', career: 'Media, performance, law, research and development.' },
  偏财: { en: 'Indirect Wealth', relation: 'The element the Day Master controls, same polarity.', traits: 'Generosity, opportunism and a head for deals; in excess, carelessness with money.', career: 'Business, investment, trade.' },
  正财: { en: 'Direct Wealth', relation: 'The element the Day Master controls, opposite polarity.', traits: 'Diligence, thrift and reliability; in excess, caution that becomes stinginess.', career: 'Accounting, administration, salaried work.' },
  七杀: { en: 'Seven Killings', relation: 'The element that controls the Day Master, same polarity.', traits: 'Courage, authority and resilience under pressure; uncontrolled, stress and conflict.', career: 'Military, police, surgery, management.' },
  正官: { en: 'Direct Officer', relation: 'The element that controls the Day Master, opposite polarity.', traits: 'Integrity, discipline and responsibility; in excess, rigidity.', career: 'Civil service, management, law.' },
  偏印: { en: 'Indirect Resource', relation: 'The element that produces the Day Master, same polarity.', traits: 'Insight, unconventional thinking and depth; in excess, isolation and suspicion.', career: 'Research, technology, medicine, metaphysics.' },
  正印: { en: 'Direct Resource', relation: 'The element that produces the Day Master, opposite polarity.', traits: 'Kindness, learning and support from mentors; in excess, dependence.', career: 'Education, academia, publishing, care work.' },
};

export const WX_EN: Record<string, string> = { 木: 'Wood', 火: 'Fire', 土: 'Earth', 金: 'Metal', 水: 'Water' };
export const YY_EN: Record<string, string> = { 阳: 'Yang', 阴: 'Yin' };
