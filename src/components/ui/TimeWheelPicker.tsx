'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock } from 'lucide-react';

interface TimeWheelPickerProps {
  selectedHour: number;
  selectedMinute: number;
  onChange: (hour: number, minute: number) => void;
  className?: string;
}

// 十二地支对应的时间范围
const EARTHLY_BRANCHES = [
  { name: '子', nameEn: 'Zi', startHour: 23, endHour: 1, color: '#1E3A8A' },    // 23:00-1:00
  { name: '丑', nameEn: 'Chou', startHour: 1, endHour: 3, color: '#7C3AED' },   // 1:00-3:00
  { name: '寅', nameEn: 'Yin', startHour: 3, endHour: 5, color: '#059669' },    // 3:00-5:00
  { name: '卯', nameEn: 'Mao', startHour: 5, endHour: 7, color: '#DC2626' },    // 5:00-7:00
  { name: '辰', nameEn: 'Chen', startHour: 7, endHour: 9, color: '#EA580C' },   // 7:00-9:00
  { name: '巳', nameEn: 'Si', startHour: 9, endHour: 11, color: '#D97706' },    // 9:00-11:00
  { name: '午', nameEn: 'Wu', startHour: 11, endHour: 13, color: '#DC2626' },   // 11:00-13:00
  { name: '未', nameEn: 'Wei', startHour: 13, endHour: 15, color: '#7C2D12' },  // 13:00-15:00
  { name: '申', nameEn: 'Shen', startHour: 15, endHour: 17, color: '#374151' }, // 15:00-17:00
  { name: '酉', nameEn: 'You', startHour: 17, endHour: 19, color: '#6B7280' },  // 17:00-19:00
  { name: '戌', nameEn: 'Xu', startHour: 19, endHour: 21, color: '#92400E' },   // 19:00-21:00
  { name: '亥', nameEn: 'Hai', startHour: 21, endHour: 23, color: '#1F2937' }   // 21:00-23:00
];

// 获取当前时间对应的地支
function getCurrentBranch(hour: number): typeof EARTHLY_BRANCHES[0] {
  for (const branch of EARTHLY_BRANCHES) {
    if (branch.startHour === 23) {
      // 子时跨天处理
      if (hour >= 23 || hour < 1) return branch;
    } else {
      if (hour >= branch.startHour && hour < branch.endHour) return branch;
    }
  }
  return EARTHLY_BRANCHES[0]; // 默认返回子时
}

export default function TimeWheelPicker({ selectedHour, selectedMinute, onChange, className = '' }: TimeWheelPickerProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hours] = useState(Array.from({ length: 24 }, (_, i) => i));
  const [minutes] = useState(Array.from({ length: 60 }, (_, i) => i));
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const currentBranch = getCurrentBranch(selectedHour);

  // 滚动到指定位置
  const scrollToValue = useCallback((containerRef: React.RefObject<HTMLDivElement | null>, value: number, itemHeight: number = 32) => {
    if (containerRef.current) {
      const scrollTop = value * itemHeight - itemHeight * 1.5; // 让选中项居中
      containerRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, []);

  // 处理小时点击
  const handleHourClick = useCallback((hour: number) => {
    onChange(hour, selectedMinute);
    scrollToValue(hourRef, hour, 32);
  }, [onChange, selectedMinute, scrollToValue]);

  // 处理分钟点击
  const handleMinuteClick = useCallback((minute: number) => {
    onChange(selectedHour, minute);
    scrollToValue(minuteRef, minute, 32);
  }, [onChange, selectedHour, scrollToValue]);

  // 初始化滚动位置
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue(hourRef, selectedHour, 32);
        scrollToValue(minuteRef, selectedMinute, 32);
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  // 处理滚动事件（防抖动）
  const handleScroll = useCallback((
    containerRef: React.RefObject<HTMLDivElement | null>, 
    values: number[], 
    callback: (value: number) => void,
    itemHeight: number = 32
  ) => {
    if (!containerRef.current) return;
    
    // 使用 requestAnimationFrame 来优化性能
    if ((containerRef.current as any).scrollRAF) {
      cancelAnimationFrame((containerRef.current as any).scrollRAF);
    }
    
    (containerRef.current as any).scrollRAF = requestAnimationFrame(() => {
      const scrollTop = containerRef.current?.scrollTop || 0;
      const centerIndex = Math.round((scrollTop + itemHeight * 1.5) / itemHeight);
      const validIndex = Math.max(0, Math.min(centerIndex, values.length - 1));
      
      const currentValue = values[validIndex];
      if (currentValue !== undefined) {
        // 添加防抖，避免频繁更新
        clearTimeout((containerRef.current as any).scrollTimeout);
        (containerRef.current as any).scrollTimeout = setTimeout(() => {
          callback(currentValue);
        }, 150); // 增加防抖时间
      }
    });
  }, []);



  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* 时间显示按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-medium text-gray-800">
                {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: currentBranch.color }}
                >
                  {currentBranch.name}
                </div>
                <span className="text-sm text-gray-600">
                  {language === 'zh' ? currentBranch.name : currentBranch.nameEn}时
                </span>
              </div>
            </div>
          </div>
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* 弹出框 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden max-w-[240px]" ref={popupRef}>
          {/* 地支显示区域 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-3 border-b border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: currentBranch.color }}
                >
                  {currentBranch.name}
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">
                    {language === 'zh' ? currentBranch.name : currentBranch.nameEn}时
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentBranch.startHour}:00-{currentBranch.endHour}:00
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 时间选择器 */}
          <div className="flex bg-white w-56">
            {/* 小时选择 */}
            <div className="flex-1 relative">
              <div className="text-center py-1 text-sm font-medium text-gray-700 bg-gray-50">
                {language === 'zh' ? '时' : 'Hour'}
              </div>
              <div 
                ref={hourRef}
                className="h-32 overflow-y-auto overflow-x-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={() => handleScroll(hourRef, hours, (hour) => onChange(hour, selectedMinute), 32)}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="py-12"> {/* 缩小padding */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className={`h-8 flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-150 ${
                        hour === selectedHour
                          ? 'bg-orange-100 text-orange-600 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => handleHourClick(hour)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="w-px bg-gray-200"></div>

            {/* 分钟选择 */}
            <div className="flex-1 relative">
              <div className="text-center py-1 text-sm font-medium text-gray-700 bg-gray-50">
                {language === 'zh' ? '分' : 'Min'}
              </div>
              <div 
                ref={minuteRef}
                className="h-32 overflow-y-auto overflow-x-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={() => handleScroll(minuteRef, minutes, (minute) => onChange(selectedHour, minute), 32)}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="py-12">
                  {minutes.map((minute) => (
                    <div
                      key={minute}
                      className={`h-8 flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-150 ${
                        minute === selectedMinute
                          ? 'bg-orange-100 text-orange-600 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => handleMinuteClick(minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 手动输入选项 */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600 mb-2">
              {language === 'zh' ? '或手动输入时间:' : 'Or input manually:'}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={selectedHour}
                onChange={(e) => {
                  const hour = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  handleHourClick(hour);
                }}
                className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <span className="text-gray-500">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={selectedMinute}
                onChange={(e) => {
                  const minute = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  handleMinuteClick(minute);
                }}
                className="w-14 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* 确认按钮 */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
            >
              {language === 'zh' ? '确认' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 