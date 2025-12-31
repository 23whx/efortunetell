'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BaZiResult {
  year: { stem: string; branch: string; pillar: string; zodiac: string };
  month: { stem: string; branch: string; pillar: string };
  day: { stem: string; branch: string; pillar: string };
  hour: { stem: string; branch: string; pillar: string };
  formatted: string;
  elementsCount: Record<string, number>;
  elements: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
}

export default function BaZiCalculatorPage() {
  const { t } = useLanguage();
  const [datetime, setDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bazi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datetime: new Date(datetime).toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('计算失败');
      }
      
      const data = await response.json();
      setResult(data.bazi);
      
    } catch (err) {
      console.error('Calculate error:', err);
      setError(err instanceof Error ? err.message : '计算失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      '木': 'text-green-600 bg-green-50',
      '火': 'text-red-600 bg-red-50',
      '土': 'text-yellow-600 bg-yellow-50',
      '金': 'text-gray-600 bg-gray-50',
      '水': 'text-blue-600 bg-blue-50'
    };
    return colors[element] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFACD] via-[#FFF5E1] to-[#FFFACD] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F61] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t('common.back')}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] mb-6 shadow-lg">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            八字计算器
          </h1>
          <p className="text-xl text-gray-600">
            输入出生日期时间，自动生成四柱八字
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              <Calendar className="inline-block mr-2" size={18} />
              选择出生日期时间
            </label>
            <div className="flex gap-4">
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF6F61] focus:outline-none text-lg"
              />
              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="px-8 bg-[#FF6F61] hover:bg-[#FF5A4D] rounded-xl flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock size={18} className="animate-spin" />
                    计算中...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    计算八字
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-red-600 text-sm">{error}</p>
            )}
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-6">
              {/* Four Pillars Display */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">四柱八字</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: '年柱', data: result.year, extra: `(${result.year.zodiac}年)` },
                    { label: '月柱', data: result.month },
                    { label: '日柱', data: result.day },
                    { label: '时柱', data: result.hour }
                  ].map((pillar, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs font-bold text-gray-500 mb-2">
                        {pillar.label}
                      </div>
                      <div className="bg-gradient-to-br from-[#FF6F61] to-[#FF8A7A] text-white rounded-2xl p-6 shadow-lg">
                        <div className="text-4xl font-black mb-2">
                          {pillar.data.pillar}
                        </div>
                        {pillar.extra && (
                          <div className="text-xs opacity-90">{pillar.extra}</div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <span className={`inline-block px-2 py-1 rounded-full ${getElementColor(result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].stem)}`}>
                          {pillar.data.stem} - {result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].stem}
                        </span>
                        {' '}
                        <span className={`inline-block px-2 py-1 rounded-full ${getElementColor(result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].branch)}`}>
                          {pillar.data.branch} - {result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].branch}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete BaZi String */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-sm text-gray-600 mb-2">完整八字</div>
                <div className="text-3xl font-black text-gray-900 tracking-wider">
                  {result.formatted}
                </div>
              </div>

              {/* Five Elements Count */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">五行统计</h3>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(result.elementsCount).map(([element, count]) => (
                    <div
                      key={element}
                      className={`text-center p-4 rounded-xl ${getElementColor(element)}`}
                    >
                      <div className="text-2xl font-black mb-1">{element}</div>
                      <div className="text-sm font-bold">{count} 个</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">💡</span>
                  说明
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 年柱：代表祖辈、童年（0-16岁）</li>
                  <li>• 月柱：代表父母、青年（17-32岁）</li>
                  <li>• 日柱：代表自己、配偶、中年（33-48岁）</li>
                  <li>• 时柱：代表子女、晚年（49岁以后）</li>
                  <li>• 五行平衡为佳，缺某行或某行过旺需注意调和</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">技术说明</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ 本计算器使用纯本地算法，无需依赖外部API</p>
            <p>✅ 基于公历（阳历）日期时间计算天干地支</p>
            <p>✅ 支持1900年至2100年的日期范围</p>
            <p>✅ 算法参考《渊海子平》等经典命理著作</p>
          </div>
        </div>
      </div>
    </div>
  );
}

