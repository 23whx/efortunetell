import React from 'react';
import { ButtonHTMLAttributes, FC } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'primary' | 'outline' | 'custom';
}

const Button: FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  if (variant === 'custom') {
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  }
  let base = 'px-4 py-2 rounded-lg font-sans font-medium transition-colors duration-150';
  let style = '';
  if (variant === 'outline') {
    style = 'bg-transparent text-[#FF6F61] border border-[#FF6F61] hover:bg-[#FF6F61] hover:text-white';
  } else {
    style = 'bg-[#FF6F61] text-white border border-[#FF6F61] hover:bg-[#ff8a75] hover:border-[#ff8a75]';
  }
  return (
    <button
      className={`${base} ${style} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;