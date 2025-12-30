import { useState } from 'react';
import { TIMEZONES, DEFAULT_TIMEZONE } from '@/utils/dateUtils';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimezoneSelectorProps {
  selectedTimezone: string;
  onChange: (timezone: string) => void;
  className?: string;
}

export default function TimezoneSelector({ 
  selectedTimezone = DEFAULT_TIMEZONE, 
  onChange,
  className = ''
}: TimezoneSelectorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // 获取当前选中的时区信息
  const currentTimezone = TIMEZONES.find(tz => tz.id === selectedTimezone) || TIMEZONES[0];
  
  const getTimezoneName = (tz: any) => {
    if (tz.nameKey) {
      const translated = t(tz.nameKey);
      if (translated !== tz.nameKey) {
        // Find the offset part from the original name if possible
        const offsetMatch = tz.name.match(/\(UTC.*\)/);
        return offsetMatch ? `${translated} ${offsetMatch[0]}` : translated;
      }
    }
    return tz.name;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe size={16} className="text-[#FF6F61]" />
        <span>{getTimezoneName(currentTimezone)}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg py-1 max-h-96 overflow-y-auto">
          {TIMEZONES.map((timezone) => (
            <button
              key={timezone.id}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                timezone.id === selectedTimezone ? 'bg-[#FF6F61]/10 font-semibold' : ''
              }`}
              onClick={() => {
                onChange(timezone.id);
                setIsOpen(false);
              }}
            >
              <div className="flex justify-between items-center">
                <span>{getTimezoneName(timezone)}</span>
                {timezone.id === selectedTimezone && (
                  <span className="text-[#FF6F61]">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
