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
  const base = 'rounded-lg font-sans font-medium transition-colors duration-150';
  
  // 尺寸样式
  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-2 py-1 text-sm';
      break;
    case 'lg':
      sizeStyle = 'px-6 py-3 text-lg';
      break;
    default:
      sizeStyle = 'px-4 py-2';
      break;
  }
  
  // 变体样式
  let variantStyle = '';
  switch (variant) {
    case 'outline':
      variantStyle = 'bg-transparent text-[#FF6F61] border border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white';
      break;
    case 'destructive':
      variantStyle = 'bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600';
      break;
    case 'default':
      variantStyle = 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 hover:border-gray-300';
      break;
    default: // primary
      variantStyle = 'bg-[#FF6F61] text-white border border-[#FF6F61] hover:bg-[#ff8a75] hover:border-[#ff8a75]';
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