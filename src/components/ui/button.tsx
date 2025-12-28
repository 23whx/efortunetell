import React from 'react';
import { ButtonHTMLAttributes, FC } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'primary' | 'outline' | 'custom' | 'default' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const Button: FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'default',
  ...props 
}) => {
  if (variant === 'custom') {
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  }
  
  // 基础样式
  const base = 'rounded-xl font-sans font-medium transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  
  // 尺寸样式
  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-sm';
      break;
    case 'lg':
      sizeStyle = 'px-8 py-4 text-lg';
      break;
    default:
      sizeStyle = 'px-5 py-2.5';
      break;
  }
  
  // 变体样式
  let variantStyle = '';
  switch (variant) {
    case 'outline':
      variantStyle = 'bg-transparent text-[#FF6F61] border border-[#FF6F61]/30 hover:bg-[#FF6F61]/5 hover:border-[#FF6F61]';
      break;
    case 'destructive':
      variantStyle = 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white';
      break;
    case 'default':
      variantStyle = 'bg-gray-100/80 text-gray-800 border border-gray-200 hover:bg-white hover:shadow-md hover:border-gray-300';
      break;
    default: // primary
      variantStyle = 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20 hover:bg-[#ff8a75] hover:shadow-xl hover:shadow-[#FF6F61]/30 border-none';
      break;
  }
  
  return (
    <button
      className={`${base} ${sizeStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;