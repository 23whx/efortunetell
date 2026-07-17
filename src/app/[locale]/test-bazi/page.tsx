'use client';

import { useState } from 'react';

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
  input: {
    datetime: string;
    year: number;
    month: number;
    day: number;
    hour: number;
  };
}

export default function TestBaZiPage() {
  const [datetime, setDatetime] = useState('2025-12-31T19:01');
  const [result, setResult] = useState<BaZiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
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
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : '计算失败');
    } finally {
      setLoading(false);
    }
  };

  // 快速测试用例
  const testCases = [
    { label: '测试 1：2025-12-31 19:01', value: '2025-12-31T19:01' },
    { label: '测试 2：2024-01-01 00:00', value: '2024-01-01T00:00' },
    { label: '测试 3：1990-05-15 14:30', value: '1990-05-15T14:30' },
    { label: '测试 4：2000-06-06 12:00', value: '2000-06-06T12:00' },
    { label: '测试 5：1985-03-21 08:15', value: '1985-03-21T08:15' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            八字计算器测试页面
          </h1>
          <p className="text-gray-600">
            快速测试八字计算是否准确
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            选择测试日期时间：
          </label>
          <div className="flex gap-4 mb-4">
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '计算中...' : '计算八字'}
            </button>
          </div>

          {/* Quick Test Cases */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">快速测试用例：</p>
            <div className="flex flex-wrap gap-2">
              {testCases.map((test, index) => (
                <button
                  key={index}
                  onClick={() => setDatetime(test.value)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {test.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              计算结果
            </h2>

            {/* Input Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">📅 输入时间</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>公历：{result.input.year}年{result.input.month}月{result.input.day}日 {result.input.hour}时</div>
                <div>ISO格式：{new Date(result.input.datetime).toLocaleString('zh-CN')}</div>
              </div>
            </div>

            {/* BaZi Display */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">🎯 四柱八字</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: '年柱', pillar: result.year, extra: result.year.zodiac },
                  { label: '月柱', pillar: result.month },
                  { label: '日柱', pillar: result.day },
                  { label: '时柱', pillar: result.hour }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg py-4 px-2">
                      <div className="text-3xl font-bold">{item.pillar.pillar}</div>
                      {item.extra && (
                        <div className="text-xs mt-1 opacity-90">({item.extra})</div>
                      )}
                    </div>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="text-gray-600">
                        天干: {item.pillar.stem} ({result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].stem})
                      </div>
                      <div className="text-gray-600">
                        地支: {item.pillar.branch} ({result.elements[['year', 'month', 'day', 'hour'][index] as keyof typeof result.elements].branch})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">完整八字</div>
                <div className="text-2xl font-bold text-gray-900 tracking-widest">
                  {result.formatted}
                </div>
              </div>
            </div>

            {/* Elements Count */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">🌈 五行统计</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(result.elementsCount).map(([element, count]) => {
                  const colors: Record<string, string> = {
                    '木': 'bg-green-100 text-green-700 border-green-300',
                    '火': 'bg-red-100 text-red-700 border-red-300',
                    '土': 'bg-yellow-100 text-yellow-700 border-yellow-300',
                    '金': 'bg-gray-100 text-gray-700 border-gray-300',
                    '水': 'bg-blue-100 text-blue-700 border-blue-300'
                  };
                  return (
                    <div
                      key={element}
                      className={`text-center p-4 rounded-lg border-2 ${colors[element]}`}
                    >
                      <div className="text-xl font-bold">{element}</div>
                      <div className="text-2xl font-black mt-1">{count}</div>
                      <div className="text-xs mt-1">个</div>
                    </div>
                  );
                })}
              </div>
              
              {/* Missing Elements */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="font-medium">五行缺：</span>
                {Object.entries(result.elementsCount)
                  .filter(([, count]) => count === 0)
                  .map(([element]) => element)
                  .join('、') || '无（五行俱全）'}
              </div>
            </div>

            {/* Detailed Info */}
            <details className="mt-6">
              <summary className="cursor-pointer font-bold text-gray-900 mb-2">
                🔍 查看详细数据（JSON）
              </summary>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            {/* Verification Tips */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-bold text-green-900 mb-2">✅ 验证方法</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>对比其他万年历网站（如：信达利、元亨利贞、灵棋经等）</li>
                <li>查看生肖是否正确（注意：立春前算上一年）</li>
                <li>检查五行统计是否合理（总共8个字，五行分布）</li>
                <li>验证时柱地支（子时23-1点、丑时1-3点...）</li>
              </ol>
            </div>
          </div>
        )}

        {/* Reference Links */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">🔗 参考对比网站</h3>
          <ul className="space-y-2 text-sm text-blue-600">
            <li>
              <a href="https://www.xindali.com/wannianli/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                ➤ 信达利万年历
              </a>
            </li>
            <li>
              <a href="https://www.china95.net/paipan/bazi/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                ➤ 元亨利贞八字排盘
              </a>
            </li>
            <li>
              <a href="https://www.buyiju.com/bazi/paipan.html" target="_blank" rel="noopener noreferrer" className="hover:underline">
                ➤ 卜易居八字排盘
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            提示：可以用相同的日期时间在以上网站测试，对比结果是否一致
          </p>
        </div>
      </div>
    </div>
  );
}

