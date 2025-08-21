'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { API_BASE_URL } from '@/config/api';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [data, setData] = useState<BaziPersonaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // 根据当前语言获取对应的数据
  const currentData = data ? data[language] : null;

  useEffect(() => {
    // 从URL参数获取表单数据
    const name = searchParams.get('name') || '用户';
    const gender = searchParams.get('gender') || '男';
    const birthYear = searchParams.get('birthYear');
    const birthMonth = searchParams.get('birthMonth');
    const birthDay = searchParams.get('birthDay');
    const birthHour = searchParams.get('birthHour');
    const birthMinute = searchParams.get('birthMinute');
    const timezone = searchParams.get('timezone') || 'Asia/Shanghai';
    if (!birthYear || !birthMonth || !birthDay || !birthHour) {
      setError('数据不存在或已过期，请重新生成');
      setLoading(false);
      return;
    }
    // 请求后端生成八字性格画像
    fetch(`${API_BASE_URL}/api/bazi-persona/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        gender: gender === '男' ? 'male' : 'female',
        year: Number(birthYear),
        month: Number(birthMonth),
        day: Number(birthDay),
        hour: Number(birthHour),
        minute: Number(birthMinute) || 0,
        timezone,
        language
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || '生成失败，请重试');
        }
      })
      .catch(() => setError('网络错误，请稍后重试'))
      .finally(() => setLoading(false));
  }, [searchParams, language]);

  const handleShare = async () => {
    if (!data || !currentData) return;
    
    // 生成分享图片
    await generateShareImage();
    
    setShowShareModal(true);
  };

  // 生成分享图片
  const generateShareImage = async () => {
    if (!data || !currentData) return;
    
    try {
      console.log('🎨 开始生成分享图片...');
      
      // 创建Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布尺寸 (适合微信分享的比例)
      canvas.width = 800;
      canvas.height = 1000;

      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FFFACD');
      gradient.addColorStop(1, '#FFF8E1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 设置字体
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333';

      // 绘制标题
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#FF6F61';
      ctx.fillText(currentData?.personaTitle || '八字性格画像', 400, 80);

      // 绘制用户信息
      ctx.font = '24px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`${data.name} • ${data.gender} • ${data.age}岁`, 400, 130);

      // 绘制关键词标签
      let yPos = 180;
      if (currentData?.keywordTags && currentData.keywordTags.length > 0) {
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#8B4513';
        ctx.fillText('性格关键词', 400, yPos);
        
        yPos += 40;
        ctx.font = '18px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#FF6F61';
        const tagsText = currentData.keywordTags.slice(0, 6).join(' • ');
        ctx.fillText(tagsText, 400, yPos);
        yPos += 50;
      }

      // 绘制性格维度（选择前4个重要维度）
      const dimensions = [
        { key: 'behaviorTendency', title: '行为倾向' },
        { key: 'thinkingStyle', title: '思维方式' },
        { key: 'communicationStyle', title: '沟通风格' },
        { key: 'emotionalManagement', title: '情绪管理' }
      ];

      ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#8B4513';
      ctx.fillText('性格维度分析', 400, yPos);
      yPos += 40;

      ctx.font = '16px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      
      dimensions.forEach(dim => {
        const content = currentData?.personalityDimensions?.[dim.key as keyof typeof currentData.personalityDimensions];
        if (content) {
          ctx.fillStyle = '#FF6F61';
          ctx.fillText(`${dim.title}:`, 80, yPos);
          
          ctx.fillStyle = '#555';
          // 文本换行处理
          const maxWidth = 640;
          const words = content.split('');
          let line = '';
          let lineHeight = 25;
          let currentY = yPos;
          
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line, 200, currentY);
              line = words[n];
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 200, currentY);
          yPos = currentY + 35;
        }
      });

      // 绘制雷达图数据（简化版本）
      if (currentData?.personalityRadar) {
        yPos += 20;
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
        ctx.fillStyle = '#8B4513';
        ctx.fillText('性格雷达分析', 400, yPos);
        yPos += 40;

        const radarData = currentData.personalityRadar;
        const radarKeys = [
          { key: 'rationalThinking', name: '理性思维' },
          { key: 'emotionalExpression', name: '情感表达' },
          { key: 'actionSpeed', name: '行动力' },
          { key: 'extroversion', name: '外向性' },
          { key: 'empathy', name: '共情力' },
          { key: 'orderSense', name: '秩序感' }
        ];

        // 绘制雷达图数值
        ctx.font = '16px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        
        const leftCol = radarKeys.slice(0, 3);
        const rightCol = radarKeys.slice(3, 6);
        
        leftCol.forEach((item, index) => {
          const value = radarData[item.key as keyof typeof radarData] || 50;
          ctx.fillStyle = '#FF6F61';
          ctx.fillText(`${item.name}: ${value}`, 100, yPos + index * 30);
        });
        
        rightCol.forEach((item, index) => {
          const value = radarData[item.key as keyof typeof radarData] || 50;
          ctx.fillStyle = '#FF6F61';
          ctx.fillText(`${item.name}: ${value}`, 450, yPos + index * 30);
        });
        
        yPos += 120;
      }

      // 绘制底部信息
      yPos = canvas.height - 100;
      ctx.textAlign = 'center';
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#8B4513';
      ctx.fillText('扫码查看完整报告', 400, yPos);
      
      ctx.font = '14px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('efortunetell.blog • 易理命学', 400, yPos + 30);

      // 将Canvas转换为图片并下载
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `八字性格画像_${data.name}_${new Date().getTime()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('✅ 分享图片生成成功');
        }
      }, 'image/png');

    } catch (error) {
      console.error('❌ 生成分享图片失败:', error);
    }
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

  // 判断是否有雷达图数据
  const hasRadar = currentData?.personalityRadar && Object.keys(currentData.personalityRadar).length > 0;
  if (!hasRadar) {
    console.log('⚠️ 后端未返回雷达图分值，前端不显示雷达图卡片。原因：personalityRadar 字段为 null 或空对象');
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
          
          {/* 分享说明 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
              <span>📸</span>
              <span className="font-medium">微信分享说明</span>
            </div>
            <p className="text-sm text-blue-600">
              点击"生成分享图片"按钮会自动下载包含您性格分析的精美图片，
              您可以保存后发送给朋友，或搭配结果链接一起分享到朋友圈！
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleShare}
              className="bg-[#FF6F61] text-white flex items-center gap-2"
            >
              <Share2 size={16} />
              生成分享图片
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
        description={`我刚生成了八字性格画像"${currentData?.personaTitle || '八字性格画像'}"，快来看看我的性格分析吧！✨ 注意：链接仅在我的浏览器有效，建议保存分享图片！`}
      />
    </div>
  );
} 