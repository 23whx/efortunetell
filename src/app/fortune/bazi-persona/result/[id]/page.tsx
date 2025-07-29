'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import PersonalityRadarChart from '@/components/ui/PersonalityRadarChart';
import ShareModal from '@/components/ui/ShareModal';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Heart, 
  BookOpen,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Star,
  Lightbulb
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PersonaLanguageData {
  personaTitle: string;
  keywordTags: string[];
  personalityDimensions: {
    behaviorTendency: string;
    thinkingStyle: string;
    communicationStyle: string;
    emotionalManagement: string;
    decisionMaking: string;
    intimateRelationship: string;
    environmentPreference: string;
    growthDirection: string;
    energySource: string;
  };
  personalityRadar: {
    rationalThinking: number;
    emotionalExpression: number;
    actionSpeed: number;
    extroversion: number;
    empathy: number;
    orderSense: number;
    adaptability: number;
  };
  recommendations: {
    matchingType: string;
    suitableEnvironment: string;
    careerDirections: string[];
  };
  summary: string;
}

interface BaziPersonaData {
  id: string;
  name: string;
  gender: string;
  birthDateTime: string;
  solarTimeInfo?: {
    originalTime: string;
    solarTime: string;
    adjustments: {
      tzOffset: number;
      isDST: boolean;
      longitude: number;
      longitudeCorrectionMinutes: number;
      totalAdjustmentMinutes: number;
    };
  };
  zh: PersonaLanguageData;
  en: PersonaLanguageData;
  destinyStructure: {
    pillars: {
      year: { stem: string; branch: string };
      month: { stem: string; branch: string };
      day: { stem: string; branch: string };
      hour: { stem: string; branch: string };
    };
    fiveElementsDistribution: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    dominantElement: string;
    dayMasterStrength: string;
    mainTenGods: string[];
    deities: string[];
  };
  age: number;
  formattedBirthDate: string;
  viewCount: number;
}

export default function BaziPersonaResultPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [data, setData] = useState<BaziPersonaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // 根据当前语言获取对应的数据
  const currentData = data ? data[language] : null;

  useEffect(() => {
    const id = params.id as string;
    const cached = typeof window !== 'undefined' ? localStorage.getItem(`baziPersona_${id}`) : null;
    if (cached) {
      const obj = JSON.parse(cached);
      // 计算年龄
      const birth = new Date(obj.birthDateTime);
      const age = Math.floor((Date.now() - birth.getTime()) / (1000 * 3600 * 24 * 365.25));
      obj.age = age;
      setData(obj);
    } else {
      setError(t('bazi.result.error.expired'));
    }
    setLoading(false);
  }, [params.id, t]);

  const handleShare = () => {
    if (!data || !currentData) return;
    setShowShareModal(true);
  };

  const handleGoBack = () => {
    router.push('/fortune');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFACD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF6F61] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('bazi.result.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFFACD] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('bazi.result.error.title')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleGoBack} className="bg-[#FF6F61] text-white">
            {t('bazi.result.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFACD] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('bazi.result.back')}
          </Button>
        </div>

        {/* 主标题区域 */}
        <div className="text-center mb-8 bg-white rounded-xl shadow-lg p-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-[#FF6F61] mb-2">
              {currentData?.personaTitle}
            </h1>
            <p className="text-gray-600 text-lg">
              {data.name}{t('bazi.result.personalityPortrait')}
            </p>
          </div>
          
          {/* 关键词标签 */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {currentData?.keywordTags && Array.isArray(currentData.keywordTags) && currentData.keywordTags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#FF6F61] text-white rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* 基础信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 justify-center max-w-sm mx-auto">
            <div>
              <span className="font-medium">{t('bazi.result.gender')}</span>{data.gender}
            </div>
            <div>
              <span className="font-medium">{t('bazi.result.age')}</span>{data.age}{t('bazi.result.ageSuffix')}
            </div>
          </div>
        </div>

        {/* 性格维度区域 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="text-[#FF6F61]" />
            {t('bazi.result.personality')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'behaviorTendency', title: t('bazi.result.behaviorTendency'), icon: <TrendingUp size={20} /> },
              { key: 'thinkingStyle', title: t('bazi.result.thinkingStyle'), icon: <Lightbulb size={20} /> },
              { key: 'communicationStyle', title: t('bazi.result.communicationStyle'), icon: <Users size={20} /> },
              { key: 'emotionalManagement', title: t('bazi.result.emotionalManagement'), icon: <Heart size={20} /> },
              { key: 'decisionMaking', title: t('bazi.result.decisionMaking'), icon: <Target size={20} /> },
              { key: 'intimateRelationship', title: t('bazi.result.intimateRelationship'), icon: <Heart size={20} /> },
              { key: 'environmentPreference', title: t('bazi.result.environmentPreference'), icon: <Star size={20} /> },
              { key: 'growthDirection', title: t('bazi.result.growthDirection'), icon: <TrendingUp size={20} /> },
              { key: 'energySource', title: t('bazi.result.energySource'), icon: <Star size={20} /> }
            ].map((item) => (
              <div key={item.key} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[#FF6F61]">{item.icon}</div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentData?.personalityDimensions?.[item.key as keyof typeof currentData.personalityDimensions] || ''}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 真太阳时信息 */}
        {data.solarTimeInfo && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <span>🌞</span>
              {language === 'zh' ? '真太阳时信息' : 'True Solar Time Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">
                  {language === 'zh' ? '原始时间：' : 'Original Time: '}
                </span>
                <span className="text-blue-600">{data.solarTimeInfo.originalTime}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">
                  {language === 'zh' ? '真太阳时：' : 'True Solar Time: '}
                </span>
                <span className="text-blue-600">{data.solarTimeInfo.solarTime}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">
                  {language === 'zh' ? '时区偏移：' : 'Timezone Offset: '}
                </span>
                <span className="text-blue-600">{data.solarTimeInfo.adjustments.tzOffset}小时</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">
                  {language === 'zh' ? '经度修正：' : 'Longitude Correction: '}
                </span>
                <span className="text-blue-600">{data.solarTimeInfo.adjustments.longitudeCorrectionMinutes}分钟</span>
              </div>
            </div>
          </div>
        )}

        {/* 命理结构摘要 */}
        {/* 四柱展示 */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          {data.destinyStructure && data.destinyStructure.pillars && ['year', 'month', 'day', 'hour'].map(key => (
            <div key={key} className="flex flex-col items-center bg-[#FFF8E1] px-4 py-2 rounded">
              <span className="text-xs text-gray-500">
                {key === 'year' ? t('bazi.result.year') : key === 'month' ? t('bazi.result.month') : key === 'day' ? t('bazi.result.day') : t('bazi.result.hour')}
              </span>
              <span className="text-lg font-semibold text-[#8B4513]">
                {data.destinyStructure.pillars[key as 'year' | 'month' | 'day' | 'hour']?.stem || ''}
                {data.destinyStructure.pillars[key as 'year' | 'month' | 'day' | 'hour']?.branch || ''}
              </span>
            </div>
          ))}
        </div>
        {/* 五行分布 */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="text-[#FF6F61]" />
            {t('bazi.result.destinySummary')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 五行分布 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.fiveElements')}</h3>
              <div className="space-y-2">
                {data.destinyStructure && data.destinyStructure.fiveElementsDistribution && Object.entries(data.destinyStructure.fiveElementsDistribution).map(([element, count]) => (
                  <div key={element} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {element === 'wood' ? t('bazi.result.wood') : 
                       element === 'fire' ? t('bazi.result.fire') : 
                       element === 'earth' ? t('bazi.result.earth') : 
                       element === 'metal' ? t('bazi.result.metal') : t('bazi.result.water')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#FF6F61] h-2 rounded-full" 
                          style={{ width: `${(count / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 命盘信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.destinyFeatures')}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('bazi.result.dominantElement')}</span>
                  <span className="text-gray-600">{data.destinyStructure?.dominantElement || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('bazi.result.dayMasterStrength')}</span>
                  <span className="text-gray-600">{data.destinyStructure?.dayMasterStrength || ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('bazi.result.mainTenGods')}</span>
                  <span className="text-gray-600">{data.destinyStructure?.mainTenGods ? data.destinyStructure.mainTenGods.join('、') : ''}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('bazi.result.deities')}</span>
                  <span className="text-gray-600">{data.destinyStructure?.deities ? data.destinyStructure.deities.join('、') : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 人格雷达图 */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('bazi.result.personalityRadar')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 雷达图展示 */}
            <div className="bg-gray-50 rounded-lg p-4">
              {currentData?.personalityRadar ? (
                <PersonalityRadarChart 
                  data={currentData.personalityRadar}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">{t('bazi.result.radarPlaceholder')}</p>
                </div>
              )}
            </div>
            
            {/* 数值列表（作为雷达图的补充） */}
            <div className="space-y-3">
              {currentData?.personalityRadar && Object.entries(currentData.personalityRadar).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">
                    {key === 'rationalThinking' ? t('bazi.result.rationalThinking') :
                     key === 'emotionalExpression' ? t('bazi.result.emotionalExpression') :
                     key === 'actionSpeed' ? t('bazi.result.actionSpeed') :
                     key === 'extroversion' ? t('bazi.result.extroversion') :
                     key === 'empathy' ? t('bazi.result.empathy') :
                     key === 'orderSense' ? t('bazi.result.orderSense') :
                     key === 'adaptability' ? t('bazi.result.adaptability') : key}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#FF6F61] h-2 rounded-full" 
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 建议和总结 */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Briefcase className="text-[#FF6F61]" />
            {t('bazi.result.suggestions')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 匹配建议 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.matchingType')}</h3>
              <p className="text-gray-600 text-sm">{currentData?.recommendations?.matchingType || ''}</p>
            </div>
            
            {/* 适合环境 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.suitableEnvironment')}</h3>
              <p className="text-gray-600 text-sm">{currentData?.recommendations?.suitableEnvironment || ''}</p>
            </div>
          </div>
          
          {/* 职业方向 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.careerDirections')}</h3>
            <div className="flex flex-wrap gap-2">
              {currentData?.recommendations?.careerDirections && Array.isArray(currentData.recommendations.careerDirections) && currentData.recommendations.careerDirections.map((career: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
          
          {/* 总结 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('bazi.result.summary')}</h3>
            <p className="text-gray-600 leading-relaxed">{currentData?.summary || ''}</p>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="text-center bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 mb-4">
            {t('bazi.result.overallSummary')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleShare}
              className="bg-[#FF6F61] text-white flex items-center gap-2"
            >
              <Share2 size={16} />
              {t('bazi.result.share')}
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
            >
              {t('bazi.result.reanalyze')}
            </Button>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={currentData?.personaTitle || '八字性格画像'}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        description={t('bazi.share.text').replace('{title}', currentData?.personaTitle || '八字性格画像')}
      />
    </div>
  );
} 