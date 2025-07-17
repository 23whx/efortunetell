'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TimezoneSelector from '@/components/ui/TimezoneSelector';
import { API_BASE_URL } from '@/config/api';
import { CalendarDays, Star, TrendingUp, Loader2 } from 'lucide-react';
import { DEFAULT_TIMEZONE } from '@/utils/dateUtils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BaziPersonaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    timezone: DEFAULT_TIMEZONE
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 十二时辰数据
  const timeHours = [
    { value: '23', label: t('bazi.hour.zi') },
    { value: '1', label: t('bazi.hour.chou') },
    { value: '3', label: t('bazi.hour.yin') },
    { value: '5', label: t('bazi.hour.mao') },
    { value: '7', label: t('bazi.hour.chen') },
    { value: '9', label: t('bazi.hour.si') },
    { value: '11', label: t('bazi.hour.wu') },
    { value: '13', label: t('bazi.hour.wei') },
    { value: '15', label: t('bazi.hour.shen') },
    { value: '17', label: t('bazi.hour.you') },
    { value: '19', label: t('bazi.hour.xu') },
    { value: '21', label: t('bazi.hour.hai') }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 验证输入 - name是可选的，其他字段必填
      if (!formData.birthYear || !formData.birthMonth || !formData.birthDay || !formData.birthHour) {
        setError(t('bazi.form.error.incomplete'));
        setLoading(false);
        return;
      }

      // 验证日期有效性
      const year = parseInt(formData.birthYear);
      const month = parseInt(formData.birthMonth);
      const day = parseInt(formData.birthDay);
      const hour = parseInt(formData.birthHour);

      if (year < 1900 || year > 2024) {
        setError(t('bazi.form.error.year'));
        setLoading(false);
        return;
      }

      if (month < 1 || month > 12) {
        setError(t('bazi.form.error.month'));
        setLoading(false);
        return;
      }

      if (day < 1 || day > 31) {
        setError(t('bazi.form.error.day'));
        setLoading(false);
        return;
      }

      console.log('📝 提交表单数据:', formData);

      const response = await fetch(`${API_BASE_URL}/api/bazi-persona/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name || '用户', // 如果没有提供name，使用默认值
          gender: formData.gender === '男' ? 'male' : 'female',
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: 0, // 默认为0分钟
          timezone: formData.timezone
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ 八字性格画像生成成功');
        const key = data.data.id || Date.now().toString();
        // 保存到浏览器缓存
        if (typeof window !== 'undefined') {
          localStorage.setItem(`baziPersona_${key}`, JSON.stringify(data.data));
        }
        // 跳转到结果页面
        router.push(`/fortune/bazi-persona/result/${key}`);
      } else {
        console.error('❌ 生成失败:', data.message);
        setError(data.message || t('bazi.form.error.generate'));
      }
    } catch (error) {
      console.error('❌ 网络错误:', error);
      setError(t('bazi.form.error.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFACD] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#FF6F61] mb-4">{t('bazi.title')}</h1>
          <p className="text-gray-600 text-lg">
            {t('bazi.subtitle')}
          </p>
        </div>

        {/* 表单区域 - 主卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-[#8B4513] mb-6 text-center">{t('bazi.form.title')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 第一行：出生年份、月份、日期 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.year')}
                </label>
                <Input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleInputChange}
                  placeholder="如：1990"
                  min="1900"
                  max="2024"
                  className="w-full text-center"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.month')}
                </label>
                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] text-center bg-white"
                >
                  <option value="">{t('bazi.form.selectMonth')}</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}{t('bazi.form.monthSuffix')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.day')}
                </label>
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] text-center bg-white"
                >
                  <option value="">{t('bazi.form.selectDay')}</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}{t('bazi.form.daySuffix')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 第二行：出生时辰、性别、时区 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.hour')}
                </label>
                <select
                  name="birthHour"
                  value={formData.birthHour}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6F61] bg-white"
                >
                  <option value="">{t('bazi.form.selectHour')}</option>
                  {timeHours.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.gender')}
                </label>
                <div className="flex gap-4 items-center h-10">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="男"
                      checked={formData.gender === '男'}
                      onChange={handleInputChange}
                      className="mr-2 text-[#FF6F61] focus:ring-[#FF6F61]"
                    />
                    <span>{t('bazi.form.male')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="女"
                      checked={formData.gender === '女'}
                      onChange={handleInputChange}
                      className="mr-2 text-[#FF6F61] focus:ring-[#FF6F61]"
                    />
                    <span>{t('bazi.form.female')}</span>
                  </label>
                </div>
              </div>

              {/* 时区选择器 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bazi.form.timezone')}
                </label>
                <TimezoneSelector
                  selectedTimezone={formData.timezone}
                  onChange={(tz: string) => setFormData(prev => ({ ...prev, timezone: tz }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* 第三行：昵称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bazi.form.name')}
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('bazi.form.namePlaceholder')}
                className="w-full"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 提交按钮 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D2691E] hover:bg-[#CD853F] text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px]"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center">
                  {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                  {loading ? t('bazi.form.submitting') : t('bazi.form.submit')}
                </div>
                {loading && (
                  <div className="text-sm mt-1 opacity-90">
                    {t('bazi.form.submittingDetail')}
                  </div>
                )}
              </div>
            </Button>
          </form>

          {/* 说明文字 */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 text-center">
              {t('bazi.form.notice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 