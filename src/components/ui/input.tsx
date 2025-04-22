import React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`px-4 py-2 rounded-lg border border-[#FF6F61] bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6F61] transition-colors duration-150 ${className}`}
      {...props}
    />
  )
);

export default Input;
