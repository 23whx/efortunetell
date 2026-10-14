/**
 * English Chinese-zodiac content (/en/chinese-zodiac). Year facts (lunar new year, Li Chun, stem-branch,
 * Na Yin) are computed in ./years.ts; this file holds the hand-written descriptions.
 */

export type AnimalKey = 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig';
export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Animal {
  key: AnimalKey;
  name: string;
  zh: string;
  branch: string;
  branchPinyin: string;
  /** fixed element of the earthly branch */
  branchElement: ElementKey;
  hours: string;
  strengths: string;
  challenges: string;
  /** 三合 trine partners + 六合 secret friend */
  trine: AnimalKey[];
  secretFriend: AnimalKey;
  /** 六冲 */
  clash: AnimalKey;
  /** 六害 */
  harm: AnimalKey;
}

/** Order = earthly branch order 子丑寅卯辰巳午未申酉戌亥 */
export const ANIMALS: Animal[] = [
  { key: 'rat', name: 'Rat', zh: '鼠', branch: '子', branchPinyin: 'Zi', branchElement: 'water', hours: '11 pm to 1 am',
    strengths: 'Quick-witted, resourceful and observant. Rats read situations fast, save for a rainy day and are good at turning small openings into opportunities.',
    challenges: 'Can be restless, overly cautious with money or quietly calculating; worry tends to run ahead of the facts.',
    trine: ['dragon', 'monkey'], secretFriend: 'ox', clash: 'horse', harm: 'goat' },
  { key: 'ox', name: 'Ox', zh: '牛', branch: '丑', branchPinyin: 'Chou', branchElement: 'earth', hours: '1 am to 3 am',
    strengths: 'Steady, patient and dependable. The Ox builds slowly and finishes what it starts, earning trust through consistency rather than words.',
    challenges: 'Stubborn once a decision is made and slow to adapt; may keep feelings to itself until they boil over.',
    trine: ['snake', 'rooster'], secretFriend: 'rat', clash: 'goat', harm: 'horse' },
  { key: 'tiger', name: 'Tiger', zh: '虎', branch: '寅', branchPinyin: 'Yin', branchElement: 'wood', hours: '3 am to 5 am',
    strengths: 'Brave, energetic and protective. Tigers lead from the front, defend the people they care about and are drawn to challenges others avoid.',
    challenges: 'Impulsive and proud; may act before thinking and resist authority even when it would help them.',
    trine: ['horse', 'dog'], secretFriend: 'pig', clash: 'monkey', harm: 'snake' },
  { key: 'rabbit', name: 'Rabbit', zh: '兔', branch: '卯', branchPinyin: 'Mao', branchElement: 'wood', hours: '5 am to 7 am',
    strengths: 'Gentle, tactful and refined. Rabbits have good taste, keep the peace and are skilled at diplomacy and careful work.',
    challenges: 'Avoids conflict to a fault and can be indecisive or overly sensitive to criticism.',
    trine: ['goat', 'pig'], secretFriend: 'dog', clash: 'rooster', harm: 'dragon' },
  { key: 'dragon', name: 'Dragon', zh: '龙', branch: '辰', branchPinyin: 'Chen', branchElement: 'earth', hours: '7 am to 9 am',
    strengths: 'Confident, ambitious and charismatic. Dragons think big, inspire others and have the drive to turn large plans into reality.',
    challenges: 'Can be domineering or impatient with slower people, and dislikes admitting mistakes.',
    trine: ['rat', 'monkey'], secretFriend: 'rooster', clash: 'dog', harm: 'rabbit' },
  { key: 'snake', name: 'Snake', zh: '蛇', branch: '巳', branchPinyin: 'Si', branchElement: 'fire', hours: '9 am to 11 am',
    strengths: 'Wise, perceptive and composed. Snakes think deeply, read people well and move decisively once they have weighed the options.',
    challenges: 'Secretive and slow to trust; can hold on to grudges or become possessive.',
    trine: ['ox', 'rooster'], secretFriend: 'monkey', clash: 'pig', harm: 'tiger' },
  { key: 'horse', name: 'Horse', zh: '马', branch: '午', branchPinyin: 'Wu', branchElement: 'fire', hours: '11 am to 1 pm',
    strengths: 'Lively, independent and warm-hearted. Horses love freedom and movement, work hard when inspired and win people over with enthusiasm.',
    challenges: 'Restless and easily bored; enthusiasm can fade before a task is done, and they resent being tied down.',
    trine: ['tiger', 'dog'], secretFriend: 'goat', clash: 'rat', harm: 'ox' },
  { key: 'goat', name: 'Goat', zh: '羊', branch: '未', branchPinyin: 'Wei', branchElement: 'earth', hours: '1 pm to 3 pm',
    strengths: 'Kind, creative and empathetic. Goats (also called Sheep) have artistic sense, care for others and create calm around them.',
    challenges: 'Prone to worry and pessimism, and may rely on others to make the hard decisions.',
    trine: ['rabbit', 'pig'], secretFriend: 'horse', clash: 'ox', harm: 'rat' },
  { key: 'monkey', name: 'Monkey', zh: '猴', branch: '申', branchPinyin: 'Shen', branchElement: 'metal', hours: '3 pm to 5 pm',
    strengths: 'Clever, inventive and adaptable. Monkeys solve problems in unexpected ways, learn fast and bring humour into any room.',
    challenges: 'Can be scattered or mischievous, and may cut corners when a quicker route appears.',
    trine: ['rat', 'dragon'], secretFriend: 'snake', clash: 'tiger', harm: 'pig' },
  { key: 'rooster', name: 'Rooster', zh: '鸡', branch: '酉', branchPinyin: 'You', branchElement: 'metal', hours: '5 pm to 7 pm',
    strengths: 'Observant, organised and honest. Roosters pay attention to detail, keep high standards and say what they think.',
    challenges: 'Critical and perfectionist; bluntness can hurt, and they may care too much about appearances.',
    trine: ['ox', 'snake'], secretFriend: 'dragon', clash: 'rabbit', harm: 'dog' },
  { key: 'dog', name: 'Dog', zh: '狗', branch: '戌', branchPinyin: 'Xu', branchElement: 'earth', hours: '7 pm to 9 pm',
    strengths: 'Loyal, fair and responsible. Dogs stand up for what is right, keep their promises and are the friend people call in a crisis.',
    challenges: 'Anxious and suspicious of strangers; can be stubborn or judgemental when values clash.',
    trine: ['tiger', 'horse'], secretFriend: 'rabbit', clash: 'dragon', harm: 'rooster' },
  { key: 'pig', name: 'Pig', zh: '猪', branch: '亥', branchPinyin: 'Hai', branchElement: 'water', hours: '9 pm to 11 pm',
    strengths: 'Generous, sincere and easy-going. Pigs enjoy life, treat people honestly and are tolerant of others’ flaws.',
    challenges: 'Too trusting at times, and may indulge comfort or avoid confrontation for too long.',
    trine: ['rabbit', 'goat'], secretFriend: 'tiger', clash: 'snake', harm: 'monkey' },
];

export const ANIMAL_BY_KEY = Object.fromEntries(ANIMALS.map((a) => [a.key, a])) as Record<AnimalKey, Animal>;

export interface ElementInfo {
  key: ElementKey;
  name: string;
  zh: string;
  /** what the element adds to the animal's character */
  trait: string;
}

export const ELEMENTS: Record<ElementKey, ElementInfo> = {
  wood: { key: 'wood', name: 'Wood', zh: '木', trait: 'Wood adds growth and generosity: a cooperative, idealistic streak and a wish to help things and people develop.' },
  fire: { key: 'fire', name: 'Fire', zh: '火', trait: 'Fire adds passion and visibility: more energy, warmth and expressiveness, along with a quicker temper.' },
  earth: { key: 'earth', name: 'Earth', zh: '土', trait: 'Earth adds stability and practicality: a patient, grounded approach and a strong sense of responsibility.' },
  metal: { key: 'metal', name: 'Metal', zh: '金', trait: 'Metal adds determination and principle: clear goals, strong willpower and little patience for compromise.' },
  water: { key: 'water', name: 'Water', zh: '水', trait: 'Water adds intuition and flexibility: good communication, sensitivity to others and a talent for finding a way around obstacles.' },
};

/** Heavenly stem → element + polarity */
export const STEMS: Record<string, { pinyin: string; element: ElementKey; yang: boolean }> = {
  甲: { pinyin: 'Jia', element: 'wood', yang: true },
  乙: { pinyin: 'Yi', element: 'wood', yang: false },
  丙: { pinyin: 'Bing', element: 'fire', yang: true },
  丁: { pinyin: 'Ding', element: 'fire', yang: false },
  戊: { pinyin: 'Wu', element: 'earth', yang: true },
  己: { pinyin: 'Ji', element: 'earth', yang: false },
  庚: { pinyin: 'Geng', element: 'metal', yang: true },
  辛: { pinyin: 'Xin', element: 'metal', yang: false },
  壬: { pinyin: 'Ren', element: 'water', yang: true },
  癸: { pinyin: 'Gui', element: 'water', yang: false },
};

/** 纳音 English names + one-line meaning */
export const NAYIN_EN: Record<string, { name: string; meaning: string }> = {
  海中金: { name: 'Gold in the Sea', meaning: 'Hidden value that shows itself when the time is right.' },
  炉中火: { name: 'Fire in the Furnace', meaning: 'Focused heat that forges and refines; strength through discipline.' },
  大林木: { name: 'Wood of the Great Forest', meaning: 'Broad, sheltering growth; generosity and staying power.' },
  路旁土: { name: 'Earth by the Roadside', meaning: 'Practical ground that supports the traffic of daily life.' },
  剑锋金: { name: 'Metal of the Sword Edge', meaning: 'Sharp, decisive and tempered by pressure.' },
  山头火: { name: 'Fire on the Mountain Top', meaning: 'A visible flame that is seen from far away; reputation and reach.' },
  涧下水: { name: 'Water of the Mountain Stream', meaning: 'Clear, quick and lively; a fresh mind.' },
  城头土: { name: 'Earth of the City Wall', meaning: 'Solid, protective earth; responsibility and defence.' },
  白蜡金: { name: 'White Wax Metal', meaning: 'Metal not yet forged: talent that grows through training.' },
  杨柳木: { name: 'Willow Wood', meaning: 'Soft and flexible; grace and adaptability.' },
  泉中水: { name: 'Water in the Spring', meaning: 'A steady source that never runs dry; persistence.' },
  屋上土: { name: 'Earth on the Roof', meaning: 'Earth that shelters a household; care and security.' },
  霹雳火: { name: 'Thunderbolt Fire', meaning: 'Sudden, powerful energy; bold breakthroughs.' },
  松柏木: { name: 'Pine and Cypress Wood', meaning: 'Evergreen in winter; integrity and endurance.' },
  长流水: { name: 'Long-Flowing Water', meaning: 'A river that keeps going; patience and long vision.' },
  砂中金: { name: 'Gold in the Sand', meaning: 'Value revealed by sifting; success through effort.' },
  山下火: { name: 'Fire at the Foot of the Mountain', meaning: 'Warm evening light; quiet, steady warmth.' },
  平地木: { name: 'Wood of the Open Plain', meaning: 'Trees on level ground; steady, practical growth.' },
  壁上土: { name: 'Earth on the Wall', meaning: 'Plaster that holds a structure together; reliability.' },
  金箔金: { name: 'Gold Leaf', meaning: 'Delicate, decorative metal; refinement and polish.' },
  覆灯火: { name: 'Lamp Fire', meaning: 'A covered lamp lighting the dark; insight and guidance.' },
  天河水: { name: 'Water of the Heavenly River', meaning: 'Rain from the sky that nourishes everything; kindness.' },
  大驿土: { name: 'Earth of the Great Highway', meaning: 'Roads that connect places; travel and networks.' },
  钗钏金: { name: 'Hairpin and Bracelet Gold', meaning: 'Fine jewellery; taste, charm and craftsmanship.' },
  桑柘木: { name: 'Mulberry Wood', meaning: 'Useful, productive wood; diligence and service.' },
  大溪水: { name: 'Water of the Great Stream', meaning: 'A strong, flowing stream; drive and momentum.' },
  沙中土: { name: 'Earth in the Sand', meaning: 'Shifting sandy soil; flexibility and change.' },
  天上火: { name: 'Fire in the Sky', meaning: 'The sun itself; brightness, confidence and presence.' },
  石榴木: { name: 'Pomegranate Wood', meaning: 'A tree heavy with fruit; abundance and family.' },
  大海水: { name: 'Water of the Great Sea', meaning: 'The ocean that receives all rivers; breadth of mind.' },
};
