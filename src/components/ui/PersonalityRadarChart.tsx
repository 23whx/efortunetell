'use client';
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useLanguage } from '@/contexts/LanguageContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PersonalityRadarData {
  rationalThinking: number;
  emotionalExpression: number;
  actionSpeed: number;
  extroversion: number;
  empathy: number;
  orderSense: number;
  adaptability: number;
}

interface PersonalityRadarChartProps {
  data: PersonalityRadarData;
  className?: string;
}

export default function PersonalityRadarChart({ data, className = '' }: PersonalityRadarChartProps) {
  const { t } = useLanguage();

  // 雷达图标签（按照数据顺序）
  const labels = [
    t('bazi.result.rationalThinking'),
    t('bazi.result.emotionalExpression'),
    t('bazi.result.actionSpeed'),
    t('bazi.result.extroversion'),
    t('bazi.result.empathy'),
    t('bazi.result.orderSense'),
    t('bazi.result.adaptability'),
  ];

  // 数据值（按照标签顺序）
  const values = [
    data.rationalThinking || 0,
    data.emotionalExpression || 0,
    data.actionSpeed || 0,
    data.extroversion || 0,
    data.empathy || 0,
    data.orderSense || 0,
    data.adaptability || 0,
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: t('bazi.result.personalityRadar'),
        data: values,
        backgroundColor: 'rgba(255, 111, 97, 0.2)',
        borderColor: 'rgba(255, 111, 97, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 111, 97, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 111, 97, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 隐藏图例，因为只有一个数据集
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.r}`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
          },
          color: '#374151',
        },
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 100,
          stepSize: 20,
          showLabelBackdrop: false,
          color: '#9CA3AF',
          font: {
            size: 10,
          },
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-80">
        <Radar data={chartData} options={options} />
      </div>
      
      {/* 数值显示 */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
        {labels.map((label, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="truncate">{label}</span>
            <span className="font-medium text-[#FF6F61] ml-2">{values[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 