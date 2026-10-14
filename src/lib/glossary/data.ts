/**
 * 命理术语库（/zh/terms）数据：十天干、十二地支、十神、二十四节气。
 * 六十甲子由天干地支数据组合计算（见 ./jiazi.ts）。
 */

export type Wx = '木' | '火' | '土' | '金' | '水';

export interface TianGanTerm {
  name: string;
  pinyin: string;
  yinYang: '阳' | '阴';
  wx: Wx;
  direction: string;
  season: string;
  color: string;
  organ: string;
  image: string;
  nature: string;
  /** 《滴天髓》天干论原文 */
  ditiansui: string;
  ditiansuiNote: string;
  he: string;
  chong: string | null;
  changSheng: string;
  lu: string;
}

export const TIAN_GAN_TERMS: TianGanTerm[] = [
  {
    name: '甲', pinyin: 'jiǎ', yinYang: '阳', wx: '木', direction: '东方', season: '春', color: '青', organ: '胆、头部',
    image: '参天大树、栋梁之木',
    nature: '甲木为阳木，象征挺拔向上的大树。性情正直、有主见、讲原则，富有开拓精神与责任感；不足之处是刚直少变通，遇事不肯低头。',
    ditiansui: '甲木参天，脱胎要火。春不容金，秋不容土。火炽乘龙，水宕骑虎。地润天和，植立千古。',
    ditiansuiNote: '甲木高大，需要火来发泄精英；春季木旺，不宜再见金来克伐；秋季金旺，木已受制，不宜再见土生金。火太旺时要辰土（龙）润泽，水太多时要寅木（虎）纳水。根基滋润、天时调和，方能长久挺立。',
    he: '甲己合化土', chong: '甲庚相冲', changSheng: '亥', lu: '寅',
  },
  {
    name: '乙', pinyin: 'yǐ', yinYang: '阴', wx: '木', direction: '东方', season: '春', color: '青', organ: '肝、颈项',
    image: '花草藤萝、柔韧之木',
    nature: '乙木为阴木，象征花草与藤萝。性情温和、细腻、善于适应环境，柔中带韧，懂得借力；不足之处是依赖性较强，有时犹豫多虑。',
    ditiansui: '乙木虽柔，刲羊解牛。怀丁抱丙，跨凤乘猴。虚湿之地，骑马亦忧。藤萝系甲，可春可秋。',
    ditiansuiNote: '乙木虽柔，坐未（羊）、丑（牛）之土可以扎根。天干有丙丁火，则不怕坐酉（凤）、申（猴）之金。生在亥子水乡等虚湿之地，即使遇午（马）火也难以发荣。若有甲木可攀附，则四季皆宜。',
    he: '乙庚合化金', chong: '乙辛相冲', changSheng: '午', lu: '卯',
  },
  {
    name: '丙', pinyin: 'bǐng', yinYang: '阳', wx: '火', direction: '南方', season: '夏', color: '赤', organ: '小肠、肩',
    image: '太阳之火、光明普照',
    nature: '丙火为阳火，象征太阳。性情热情、开朗、慷慨大方，喜欢表现、乐于助人；不足之处是急躁冲动，做事有时虎头蛇尾。',
    ditiansui: '丙火猛烈，欺霜侮雪。能煅庚金，逢辛反怯。土众成慈，水猖显节。虎马犬乡，甲来焚灭。',
    ditiansuiNote: '丙火猛烈，不怕冬季寒冷。能锻炼顽金庚，遇辛则相合而失其光芒。土多则火被泄而显慈爱，水旺则显其不屈之节。地支寅午戌（虎马犬）火局已成，再见甲木生火，则过烈而自焚。',
    he: '丙辛合化水', chong: '丙壬相冲', changSheng: '寅', lu: '巳',
  },
  {
    name: '丁', pinyin: 'dīng', yinYang: '阴', wx: '火', direction: '南方', season: '夏', color: '赤', organ: '心、眼',
    image: '灯烛星火、文明之火',
    nature: '丁火为阴火，象征灯烛与星光。性情温和、细心、内敛，重情义、有思想与文采；不足之处是敏感多疑，情绪容易起伏。',
    ditiansui: '丁火柔中，内性昭融。抱乙而孝，合壬而忠。旺而不烈，衰而不穷。如有嫡母，可秋可冬。',
    ditiansuiNote: '丁火外柔而内明。乙木生丁，丁火护乙不受辛金所伤，所以说"孝"；丁壬相合，壬水不再克丁，所以说"忠"。丁火旺时不至于暴烈，衰时也不会熄灭。若有甲木（嫡母）生扶，则秋冬亦无妨。',
    he: '丁壬合化木', chong: '丁癸相冲', changSheng: '酉', lu: '午',
  },
  {
    name: '戊', pinyin: 'wù', yinYang: '阳', wx: '土', direction: '中央', season: '四季末', color: '黄', organ: '胃、肋',
    image: '城墙高山、厚重之土',
    nature: '戊土为阳土，象征高山与城墙。性情稳重、厚道、守信用，有包容力与担当；不足之处是固执保守，反应偏慢。',
    ditiansui: '戊土固重，既中且正。静翕动辟，万物司命。水润物生，火燥物病。若在艮坤，怕冲宜静。',
    ditiansuiNote: '戊土厚重而中正，静时收敛、动时开发，是万物生长的根本。有水滋润则万物生长，火太燥则万物受病。生于寅申（艮坤）之月，最怕冲动，宜安静。',
    he: '戊癸合化火', chong: null, changSheng: '寅', lu: '巳',
  },
  {
    name: '己', pinyin: 'jǐ', yinYang: '阴', wx: '土', direction: '中央', season: '四季末', color: '黄', organ: '脾、腹',
    image: '田园湿土、蓄养之土',
    nature: '己土为阴土，象征田园沃土。性情谦和、细致、包容，善于积累与照顾他人；不足之处是心思重、顾虑多，有时缺乏魄力。',
    ditiansui: '己土卑湿，中正蓄藏。不愁木盛，不畏水狂。火少火晦，金多金光。若要物旺，宜助宜帮。',
    ditiansuiNote: '己土低湿而能蓄藏万物。木多能培植而不怕被克，水多能容纳而不怕泛滥。火少会被己土晦暗，金多则能使金润泽生光。要让万物旺盛，己土本身需要火土帮扶。',
    he: '甲己合化土', chong: null, changSheng: '酉', lu: '午',
  },
  {
    name: '庚', pinyin: 'gēng', yinYang: '阳', wx: '金', direction: '西方', season: '秋', color: '白', organ: '大肠、脐',
    image: '刀剑顽铁、肃杀之金',
    nature: '庚金为阳金，象征刀剑与矿石。性情刚毅果断、讲义气、有魄力，执行力强；不足之处是好胜心强，说话直接容易伤人。',
    ditiansui: '庚金带煞，刚健为最。得水而清，得火而锐。土润则生，土干则脆。能赢甲兄，输于乙妹。',
    ditiansuiNote: '庚金带肃杀之气，最为刚健。得壬水泄其锐气则清，得丁火锻炼则成器。湿土能生庚金，燥土反使其脆。庚能克甲，却与乙相合而被牵制。',
    he: '乙庚合化金', chong: '甲庚相冲', changSheng: '巳', lu: '申',
  },
  {
    name: '辛', pinyin: 'xīn', yinYang: '阴', wx: '金', direction: '西方', season: '秋', color: '白', organ: '肺、股',
    image: '珠玉首饰、温润之金',
    nature: '辛金为阴金，象征珠宝首饰。性情秀气、爱面子、重品味，心思细腻而有自尊；不足之处是敏感挑剔，抗压能力较弱。',
    ditiansui: '辛金软弱，温润而清。畏土之叠，乐水之盈。能扶社稷，能救生灵。热则喜母，寒则喜丁。',
    ditiansuiNote: '辛金柔软温润。怕土多将其埋没，喜水多以淘洗生辉。辛与丙合，能制丙火之烈以护甲木（扶社稷）；能生壬水以救火土之燥（救生灵）。夏天炎热时喜己土生扶，冬天寒冷时喜丁火温暖。',
    he: '丙辛合化水', chong: '乙辛相冲', changSheng: '子', lu: '酉',
  },
  {
    name: '壬', pinyin: 'rén', yinYang: '阳', wx: '水', direction: '北方', season: '冬', color: '黑', organ: '膀胱、胫',
    image: '江河大海、奔流之水',
    nature: '壬水为阳水，象征江河湖海。性情聪明灵活、胸襟开阔、善于变通与交际；不足之处是随性善变，缺乏耐性。',
    ditiansui: '壬水通河，能泄金气。刚中之德，周流不滞。通根透癸，冲天奔地。化则有情，从则相济。',
    ditiansuiNote: '壬水是天河之水，能泄金气。刚中而有德，周流不息。地支通根、天干又透癸水，则水势泛滥冲天奔地。与丁相合化木则有情，顺从火土之势则能相济成功。',
    he: '丁壬合化木', chong: '丙壬相冲', changSheng: '申', lu: '亥',
  },
  {
    name: '癸', pinyin: 'guǐ', yinYang: '阴', wx: '水', direction: '北方', season: '冬', color: '黑', organ: '肾、足',
    image: '雨露甘霖、滋润之水',
    nature: '癸水为阴水，象征雨露与泉水。性情温柔、内敛、富有想象力与智慧，善于观察；不足之处是多思多虑，容易消极。',
    ditiansui: '癸水至弱，达于天津。得龙而运，功化斯神。不愁火土，不论庚辛。合戊见火，化象斯真。',
    ditiansuiNote: '癸水最弱，却能上达天河化为雨露。得辰土（龙）则能变化而显神通。不怕火土多，也不在乎庚辛金来生扶。与戊相合，再见丙丁火，合化为火才是真化。',
    he: '戊癸合化火', chong: '丁癸相冲', changSheng: '卯', lu: '子',
  },
];

export interface DiZhiTerm {
  name: string;
  pinyin: string;
  zodiac: string;
  yinYang: '阳' | '阴';
  wx: Wx;
  month: string;
  hours: string;
  direction: string;
  season: string;
  cangGan: string[];
  organ: string;
  image: string;
  liuHe: string;
  sanHe: string;
  sanHui: string;
  chong: string;
  xing: string;
  hai: string;
}

export const DI_ZHI_TERMS: DiZhiTerm[] = [
  { name: '子', pinyin: 'zǐ', zodiac: '鼠', yinYang: '阳', wx: '水', month: '农历十一月（大雪至小寒）', hours: '23:00–01:00', direction: '正北', season: '仲冬', cangGan: ['癸'], organ: '肾、膀胱、耳',
    image: '子为一阳初生之地，水气最旺。象征智慧、流动与隐秘，人事上主聪明机敏、善于谋划。',
    liuHe: '子丑合土', sanHe: '申子辰合水局', sanHui: '亥子丑会北方水', chong: '子午相冲', xing: '子卯相刑（无礼之刑）', hai: '子未相害' },
  { name: '丑', pinyin: 'chǒu', zodiac: '牛', yinYang: '阴', wx: '土', month: '农历十二月（小寒至立春）', hours: '01:00–03:00', direction: '东北偏北', season: '季冬', cangGan: ['己', '癸', '辛'], organ: '脾、腹',
    image: '丑为湿寒之土，是金的墓库。象征积蓄、耐劳与守成，人事上主踏实勤恳、重积累。',
    liuHe: '子丑合土', sanHe: '巳酉丑合金局', sanHui: '亥子丑会北方水', chong: '丑未相冲', xing: '丑戌未三刑（恃势之刑）', hai: '丑午相害' },
  { name: '寅', pinyin: 'yín', zodiac: '虎', yinYang: '阳', wx: '木', month: '农历正月（立春至惊蛰）', hours: '03:00–05:00', direction: '东北偏东', season: '孟春', cangGan: ['甲', '丙', '戊'], organ: '胆、手',
    image: '寅为三阳开泰之始，木气初发。象征开创、勇猛与生机，人事上主进取、有领导力。',
    liuHe: '寅亥合木', sanHe: '寅午戌合火局', sanHui: '寅卯辰会东方木', chong: '寅申相冲', xing: '寅巳申三刑（无恩之刑）', hai: '寅巳相害' },
  { name: '卯', pinyin: 'mǎo', zodiac: '兔', yinYang: '阴', wx: '木', month: '农历二月（惊蛰至清明）', hours: '05:00–07:00', direction: '正东', season: '仲春', cangGan: ['乙'], organ: '肝、手指',
    image: '卯为木气最纯之地，正值春分前后。象征生长、文雅与舒展，人事上主温和、有艺术气质。',
    liuHe: '卯戌合火', sanHe: '亥卯未合木局', sanHui: '寅卯辰会东方木', chong: '卯酉相冲', xing: '子卯相刑（无礼之刑）', hai: '卯辰相害' },
  { name: '辰', pinyin: 'chén', zodiac: '龙', yinYang: '阳', wx: '土', month: '农历三月（清明至立夏）', hours: '07:00–09:00', direction: '东南偏东', season: '季春', cangGan: ['戊', '乙', '癸'], organ: '胃、皮肤',
    image: '辰为湿土，是水的墓库。象征变化、包容与储藏，人事上主多才多变、有抱负。',
    liuHe: '辰酉合金', sanHe: '申子辰合水局', sanHui: '寅卯辰会东方木', chong: '辰戌相冲', xing: '辰辰自刑', hai: '卯辰相害' },
  { name: '巳', pinyin: 'sì', zodiac: '蛇', yinYang: '阴', wx: '火', month: '农历四月（立夏至芒种）', hours: '09:00–11:00', direction: '东南偏南', season: '孟夏', cangGan: ['丙', '庚', '戊'], organ: '心包、三焦、面',
    image: '巳为火气渐旺之地，同时是庚金长生之所。象征文明、智谋与变化，人事上主聪慧、善于思考。',
    liuHe: '巳申合水', sanHe: '巳酉丑合金局', sanHui: '巳午未会南方火', chong: '巳亥相冲', xing: '寅巳申三刑（无恩之刑）', hai: '寅巳相害' },
  { name: '午', pinyin: 'wǔ', zodiac: '马', yinYang: '阳', wx: '火', month: '农历五月（芒种至小暑）', hours: '11:00–13:00', direction: '正南', season: '仲夏', cangGan: ['丁', '己'], organ: '心、眼',
    image: '午为火气最旺之地，一阴始生于夏至。象征光明、热烈与名声，人事上主热情、积极、重荣誉。',
    liuHe: '午未合火', sanHe: '寅午戌合火局', sanHui: '巳午未会南方火', chong: '子午相冲', xing: '午午自刑', hai: '丑午相害' },
  { name: '未', pinyin: 'wèi', zodiac: '羊', yinYang: '阴', wx: '土', month: '农历六月（小暑至立秋）', hours: '13:00–15:00', direction: '西南偏南', season: '季夏', cangGan: ['己', '丁', '乙'], organ: '脾、脊梁',
    image: '未为燥土，是木的墓库。象征温和、滋养与内敛，人事上主温厚、重情、有耐心。',
    liuHe: '午未合火', sanHe: '亥卯未合木局', sanHui: '巳午未会南方火', chong: '丑未相冲', xing: '丑戌未三刑（恃势之刑）', hai: '子未相害' },
  { name: '申', pinyin: 'shēn', zodiac: '猴', yinYang: '阳', wx: '金', month: '农历七月（立秋至白露）', hours: '15:00–17:00', direction: '西南偏西', season: '孟秋', cangGan: ['庚', '壬', '戊'], organ: '大肠、经络',
    image: '申为金气初旺之地，也是壬水长生之所。象征果决、变动与行动，人事上主机灵、反应快、善于应变。',
    liuHe: '巳申合水', sanHe: '申子辰合水局', sanHui: '申酉戌会西方金', chong: '寅申相冲', xing: '寅巳申三刑（无恩之刑）', hai: '申亥相害' },
  { name: '酉', pinyin: 'yǒu', zodiac: '鸡', yinYang: '阴', wx: '金', month: '农历八月（白露至寒露）', hours: '17:00–19:00', direction: '正西', season: '仲秋', cangGan: ['辛'], organ: '肺、精血',
    image: '酉为金气最纯之地，正值秋分前后。象征收敛、精致与决断，人事上主讲究、重仪表、有原则。',
    liuHe: '辰酉合金', sanHe: '巳酉丑合金局', sanHui: '申酉戌会西方金', chong: '卯酉相冲', xing: '酉酉自刑', hai: '酉戌相害' },
  { name: '戌', pinyin: 'xū', zodiac: '狗', yinYang: '阳', wx: '土', month: '农历九月（寒露至立冬）', hours: '19:00–21:00', direction: '西北偏西', season: '季秋', cangGan: ['戊', '辛', '丁'], organ: '命门、腿足',
    image: '戌为燥土，是火的墓库。象征忠诚、守护与收藏，人事上主正直、可靠、重承诺。',
    liuHe: '卯戌合火', sanHe: '寅午戌合火局', sanHui: '申酉戌会西方金', chong: '辰戌相冲', xing: '丑戌未三刑（恃势之刑）', hai: '酉戌相害' },
  { name: '亥', pinyin: 'hài', zodiac: '猪', yinYang: '阴', wx: '水', month: '农历十月（立冬至大雪）', hours: '21:00–23:00', direction: '西北偏北', season: '孟冬', cangGan: ['壬', '甲'], organ: '肾、头',
    image: '亥为水气初旺之地，也是甲木长生之所。象征包容、智慧与蕴藏，人事上主宽厚、有灵性。',
    liuHe: '寅亥合木', sanHe: '亥卯未合木局', sanHui: '亥子丑会北方水', chong: '巳亥相冲', xing: '亥亥自刑', hai: '申亥相害' },
];

export interface ShiShenTerm {
  name: string;
  alias: string;
  relation: string;
  liuQinMale: string;
  liuQinFemale: string;
  positive: string;
  negative: string;
  career: string;
  combos: string[];
}

export const SHI_SHEN_TERMS: ShiShenTerm[] = [
  { name: '比肩', alias: '比', relation: '与日主五行相同、阴阳相同（同我者，同性）。例：甲日见甲。',
    liuQinMale: '兄弟、朋友、同辈', liuQinFemale: '姐妹、朋友、同辈',
    positive: '独立自主、意志坚定、重情义、有自信，遇困难不轻易退缩。',
    negative: '过旺则固执己见、不善合作，容易与人竞争争夺财物。',
    career: '适合自主创业、合伙经营、体育竞技、需要独立判断的工作。',
    combos: ['身弱见比肩帮身为喜；身强再见比肩则争财（比劫夺财）。', '比肩多而有官杀制约，则能化竞争为团队协作。'] },
  { name: '劫财', alias: '劫', relation: '与日主五行相同、阴阳相反（同我者，异性）。例：甲日见乙。',
    liuQinMale: '兄弟姐妹、竞争者', liuQinFemale: '兄弟、竞争者',
    positive: '热情豪爽、行动力强、善于交际、敢于冒险。',
    negative: '过旺则冲动好胜、花钱大方易破财，做事急于求成。',
    career: '适合销售、业务开拓、投资交易、体育与需要胆识的行业。',
    combos: ['劫财最怕财星无护，"比劫夺财"主破财或婚姻不稳。', '有食伤化泄劫财之气，可转为开拓创造之力。'] },
  { name: '食神', alias: '食', relation: '日主所生，阴阳相同（我生者，同性）。例：甲日见丙。',
    liuQinMale: '孙辈、晚辈、学生', liuQinFemale: '子女（多指女儿）',
    positive: '温和乐观、有口福、才艺出众、懂得享受生活，心态平和。',
    negative: '过旺则懒散、安于现状，或想法多而行动少。',
    career: '适合餐饮、艺术、教育、设计、写作、休闲服务等行业。',
    combos: ['食神制杀：食神能制七杀，化凶为权，主有魄力而能成事。', '食神生财：才华转化为财富，是富命常见组合。', '枭神夺食：偏印过旺克食神，主才华受阻、福气减损。'] },
  { name: '伤官', alias: '伤', relation: '日主所生，阴阳相反（我生者，异性）。例：甲日见丁。',
    liuQinMale: '孙辈、晚辈', liuQinFemale: '子女（多指儿子）',
    positive: '聪明伶俐、才华横溢、口才好、富有创意与表现欲。',
    negative: '过旺则傲气、叛逆、不服管束，言语尖锐容易得罪人。',
    career: '适合演艺、传媒、律师、技术研发、设计、自由职业。',
    combos: ['伤官配印：有印星制伤，才华得以收敛而成大器。', '伤官生财：才能转化为财富，善于以技艺谋生。', '伤官见官：伤官克正官，主是非官讼，女命尤忌。'] },
  { name: '偏财', alias: '才', relation: '日主所克，阴阳相同（我克者，同性）。例：甲日见戊。',
    liuQinMale: '父亲、妾或情人', liuQinFemale: '父亲',
    positive: '慷慨大方、善于交际、眼光灵活，有经商与理财头脑。',
    negative: '过旺则重利轻义、花钱随性，感情上容易多变。',
    career: '适合经商、投资、贸易、金融、销售等与流动财富相关的工作。',
    combos: ['身强能任财，偏财为用多主横财或经商得利。', '财星生官杀：财能生官，主因财得贵或事业依靠财力。'] },
  { name: '正财', alias: '财', relation: '日主所克，阴阳相反（我克者，异性）。例：甲日见己。',
    liuQinMale: '妻子', liuQinFemale: '父亲（部分流派）、财物',
    positive: '勤劳节俭、务实稳重、诚实守信，重视家庭与稳定收入。',
    negative: '过旺则保守吝啬、目光短浅，或被物质所困。',
    career: '适合会计、财务、行政、稳定的受薪工作与实业经营。',
    combos: ['财星坏印：财多克印，主为财而影响学业、名誉或母亲。', '身弱财多，"富屋贫人"，需比劫帮身才能担财。'] },
  { name: '七杀', alias: '杀', relation: '克日主，阴阳相同（克我者，同性），又称偏官。例：甲日见庚。',
    liuQinMale: '子女（多指儿子）、小人、上司', liuQinFemale: '情人、丈夫（部分流派）',
    positive: '有魄力、敢作敢为、果断威严，能承受压力，具领导与开拓能力。',
    negative: '无制则性急暴躁、压力大、多是非，易遇小人或意外。',
    career: '适合军警、司法、外科、管理、竞争激烈的行业。',
    combos: ['杀印相生：印星化杀生身，主权威与地位。', '食神制杀：以食神制伏七杀，主有胆识而成事。', '七杀无制而身弱，为"杀重身轻"，多灾多难。'] },
  { name: '正官', alias: '官', relation: '克日主，阴阳相反（克我者，异性）。例：甲日见辛。',
    liuQinMale: '女儿、上司', liuQinFemale: '丈夫',
    positive: '正直守法、有责任心、自律稳重、重名誉，适合在体制内发展。',
    negative: '过旺则拘谨保守、压力大、缺乏魄力。',
    career: '适合公务员、管理、法律、教育等讲规范与名望的职业。',
    combos: ['官印相生：正官生印、印生身，主仕途顺利、名誉清贵。', '财官双美：财星生官，主富贵兼得。', '官杀混杂：正官七杀同时出现而无制，主事业多变、感情复杂。'] },
  { name: '偏印', alias: '枭', relation: '生日主，阴阳相同（生我者，同性），又称枭神。例：甲日见壬。',
    liuQinMale: '继母、祖父（部分流派）', liuQinFemale: '继母',
    positive: '悟性高、思维独特、领悟力强，擅长冷门学问、技术与玄学。',
    negative: '过旺则孤僻、多疑、做事有始无终，容易钻牛角尖。',
    career: '适合研究、技术、医学、宗教、玄学、设计等专业领域。',
    combos: ['枭神夺食：偏印克食神，主福禄受损、才华难展。', '偏印化杀：身弱杀重时偏印能化杀生身，转为助力。'] },
  { name: '正印', alias: '印', relation: '生日主，阴阳相反（生我者，异性）。例：甲日见癸。',
    liuQinMale: '母亲', liuQinFemale: '母亲',
    positive: '仁慈宽厚、好学上进、有涵养与文化气质，得长辈与贵人照顾。',
    negative: '过旺则依赖性强、缺乏行动力，或过于保守清高。',
    career: '适合教育、学术、文化出版、医疗护理、公益等领域。',
    combos: ['官印相生：主名誉、学业与地位。', '伤官配印：印制伤官，主才华有节制而成名。', '财星坏印：财多克印，主学业中断或为财所累。'] },
];

export interface JieQiTerm {
  name: string;
  pinyin: string;
  longitude: number;
  kind: '节' | '中气';
  /** 节 → 月建；中气 → 所在月 */
  monthZhi: string;
  approxDate: string;
  hou: [string, string, string];
  meaning: string;
}

export const JIE_QI_TERMS: JieQiTerm[] = [
  { name: '立春', pinyin: 'lì chūn', longitude: 315, kind: '节', monthZhi: '寅', approxDate: '2月3–5日', hou: ['东风解冻', '蛰虫始振', '鱼陟负冰'], meaning: '春季开始。八字以立春为一年之始，立春前出生的人年柱仍属上一年，月柱也从丑月换为寅月。' },
  { name: '雨水', pinyin: 'yǔ shuǐ', longitude: 330, kind: '中气', monthZhi: '寅', approxDate: '2月18–20日', hou: ['獭祭鱼', '鸿雁来', '草木萌动'], meaning: '降水增多，冰雪消融。大六壬以雨水为界换月将，雨水后用登明（亥将）。' },
  { name: '惊蛰', pinyin: 'jīng zhé', longitude: 345, kind: '节', monthZhi: '卯', approxDate: '3月5–7日', hou: ['桃始华', '仓庚鸣', '鹰化为鸠'], meaning: '春雷始鸣，惊醒蛰伏的动物。八字月柱由寅月换为卯月。' },
  { name: '春分', pinyin: 'chūn fēn', longitude: 0, kind: '中气', monthZhi: '卯', approxDate: '3月20–21日', hou: ['玄鸟至', '雷乃发声', '始电'], meaning: '昼夜平分，太阳直射赤道。春分后月将换为河魁（戌将）。' },
  { name: '清明', pinyin: 'qīng míng', longitude: 15, kind: '节', monthZhi: '辰', approxDate: '4月4–6日', hou: ['桐始华', '田鼠化为鴽', '虹始见'], meaning: '天清地明，是祭祖扫墓的传统节日。八字月柱换为辰月。' },
  { name: '谷雨', pinyin: 'gǔ yǔ', longitude: 30, kind: '中气', monthZhi: '辰', approxDate: '4月19–21日', hou: ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'], meaning: '雨生百谷，是春季最后一个节气。谷雨后月将换为从魁（酉将）。' },
  { name: '立夏', pinyin: 'lì xià', longitude: 45, kind: '节', monthZhi: '巳', approxDate: '5月5–6日', hou: ['蝼蝈鸣', '蚯蚓出', '王瓜生'], meaning: '夏季开始。八字月柱换为巳月，火气渐旺。' },
  { name: '小满', pinyin: 'xiǎo mǎn', longitude: 60, kind: '中气', monthZhi: '巳', approxDate: '5月20–22日', hou: ['苦菜秀', '靡草死', '麦秋至'], meaning: '夏熟作物籽粒渐满而未全满。小满后月将换为传送（申将）。' },
  { name: '芒种', pinyin: 'máng zhòng', longitude: 75, kind: '节', monthZhi: '午', approxDate: '6月5–7日', hou: ['螳螂生', '鵙始鸣', '反舌无声'], meaning: '有芒作物成熟、夏播开始。八字月柱换为午月。' },
  { name: '夏至', pinyin: 'xià zhì', longitude: 90, kind: '中气', monthZhi: '午', approxDate: '6月21–22日', hou: ['鹿角解', '蜩始鸣', '半夏生'], meaning: '白昼最长，一阴始生。奇门遁甲自夏至起由阳遁转为阴遁；月将换为小吉（未将）。' },
  { name: '小暑', pinyin: 'xiǎo shǔ', longitude: 105, kind: '节', monthZhi: '未', approxDate: '7月6–8日', hou: ['温风至', '蟋蟀居壁', '鹰始挚'], meaning: '天气开始炎热。八字月柱换为未月。' },
  { name: '大暑', pinyin: 'dà shǔ', longitude: 120, kind: '中气', monthZhi: '未', approxDate: '7月22–24日', hou: ['腐草为萤', '土润溽暑', '大雨时行'], meaning: '一年中最炎热的时期。大暑后月将换为胜光（午将）。' },
  { name: '立秋', pinyin: 'lì qiū', longitude: 135, kind: '节', monthZhi: '申', approxDate: '8月7–9日', hou: ['凉风至', '白露降', '寒蝉鸣'], meaning: '秋季开始。八字月柱换为申月，金气渐旺。' },
  { name: '处暑', pinyin: 'chǔ shǔ', longitude: 150, kind: '中气', monthZhi: '申', approxDate: '8月22–24日', hou: ['鹰乃祭鸟', '天地始肃', '禾乃登'], meaning: '暑气至此而止。处暑后月将换为太乙（巳将）。' },
  { name: '白露', pinyin: 'bái lù', longitude: 165, kind: '节', monthZhi: '酉', approxDate: '9月7–9日', hou: ['鸿雁来', '玄鸟归', '群鸟养羞'], meaning: '天气转凉，夜间草木凝露。八字月柱换为酉月。' },
  { name: '秋分', pinyin: 'qiū fēn', longitude: 180, kind: '中气', monthZhi: '酉', approxDate: '9月22–24日', hou: ['雷始收声', '蛰虫坯户', '水始涸'], meaning: '昼夜再次平分。秋分后月将换为天罡（辰将）。' },
  { name: '寒露', pinyin: 'hán lù', longitude: 195, kind: '节', monthZhi: '戌', approxDate: '10月8–9日', hou: ['鸿雁来宾', '雀入大水为蛤', '菊有黄华'], meaning: '露水寒冷将凝结。八字月柱换为戌月。' },
  { name: '霜降', pinyin: 'shuāng jiàng', longitude: 210, kind: '中气', monthZhi: '戌', approxDate: '10月23–24日', hou: ['豺乃祭兽', '草木黄落', '蛰虫咸俯'], meaning: '开始出现霜冻，是秋季最后一个节气。霜降后月将换为太冲（卯将）。' },
  { name: '立冬', pinyin: 'lì dōng', longitude: 225, kind: '节', monthZhi: '亥', approxDate: '11月7–8日', hou: ['水始冰', '地始冻', '雉入大水为蜃'], meaning: '冬季开始。八字月柱换为亥月，水气渐旺。' },
  { name: '小雪', pinyin: 'xiǎo xuě', longitude: 240, kind: '中气', monthZhi: '亥', approxDate: '11月22–23日', hou: ['虹藏不见', '天气上升，地气下降', '闭塞而成冬'], meaning: '开始降雪但量不大。小雪后月将换为功曹（寅将）。' },
  { name: '大雪', pinyin: 'dà xuě', longitude: 255, kind: '节', monthZhi: '子', approxDate: '12月6–8日', hou: ['鹖鴠不鸣', '虎始交', '荔挺出'], meaning: '降雪增多。八字月柱换为子月。' },
  { name: '冬至', pinyin: 'dōng zhì', longitude: 270, kind: '中气', monthZhi: '子', approxDate: '12月21–23日', hou: ['蚯蚓结', '麋角解', '水泉动'], meaning: '白昼最短，一阳始生。奇门遁甲自冬至起由阴遁转为阳遁；月将换为大吉（丑将）。' },
  { name: '小寒', pinyin: 'xiǎo hán', longitude: 285, kind: '节', monthZhi: '丑', approxDate: '1月5–7日', hou: ['雁北乡', '鹊始巢', '雉始雊'], meaning: '天气寒冷但未到极点。八字月柱换为丑月。' },
  { name: '大寒', pinyin: 'dà hán', longitude: 300, kind: '中气', monthZhi: '丑', approxDate: '1月20–21日', hou: ['鸡始乳', '征鸟厉疾', '水泽腹坚'], meaning: '一年中最寒冷的时期，是二十四节气的最后一个。大寒后月将换为神后（子将）。' },
];

/** 纳音五行释义（每两个干支共用一个纳音） */
export const NAYIN_MEANING: Record<string, string> = {
  海中金: '金藏于海底，有名无形，需待时机方能显现，象征潜藏的才华。',
  炉中火: '炉中炼物之火，需木助燃，象征锻炼与成就之力。',
  大林木: '大森林之木，枝繁叶茂，象征宽厚与成长。',
  路旁土: '大路两旁之土，承载往来，象征踏实与包容。',
  剑锋金: '锋利的剑刃之金，刚强锐利，象征决断与锋芒。',
  山头火: '山顶燃烧之火，光照远方，象征热情与声名远播。',
  涧下水: '山涧中的清流，清澈细长，象征清秀与灵动。',
  城头土: '城墙上的夯土，坚固而能守护，象征稳重与责任。',
  白蜡金: '尚未成器的金属原料，需火锻炼，象征可塑之才。',
  杨柳木: '柔软的杨柳，随风摇曳，象征柔顺与适应力。',
  泉中水: '泉眼流出之水，源源不断，象征生机与恒心。',
  屋上土: '屋顶瓦片之土，遮风挡雨，象征庇护与守成。',
  霹雳火: '雷电之火，声势浩大，象征突发与爆发力。',
  松柏木: '四季常青的松柏，耐寒坚韧，象征坚贞与气节。',
  长流水: '奔流不息的江河，源远流长，象征持久与胸怀。',
  砂中金: '混在砂中的金粒，需淘洗才见光，象征需磨砺而显。',
  山下火: '山脚下的火光，如夕阳余晖，象征内敛的温暖。',
  平地木: '平原上的树木，象征平稳成长与务实。',
  壁上土: '墙壁上的泥土，依附而存，象征稳定与依托。',
  金箔金: '捶打成薄片的金箔，用于装饰，象征精致与华美。',
  覆灯火: '灯罩中的灯火，照亮黑夜，象征智慧与指引。',
  天河水: '天上的雨露银河之水，润泽万物，象征清高与恩泽。',
  大驿土: '驿站大道之土，四通八达，象征通达与奔波。',
  钗钏金: '女子佩戴的钗钏首饰之金，象征精巧与品味。',
  桑柘木: '桑树与柘树，可养蚕织布，象征勤劳与实用。',
  大溪水: '山间大溪，奔腾向前，象征进取与活力。',
  沙中土: '水边沙地之土，象征灵活与可变。',
  天上火: '天上的太阳之火，普照万物，象征光明与气势。',
  石榴木: '石榴树，花红果多，象征丰盛与多子多福。',
  大海水: '浩瀚的大海，包容百川，象征胸襟与气度。',
};
