"use client";

import { useState, useEffect } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500',
  secondary: 'bg-gray-600 hover:bg-gray-500 text-white shadow-sm hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500',
  outline: 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 disabled:text-gray-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs min-h-[36px]',
  md: 'px-6 py-3 text-sm min-h-[44px]',
  lg: 'px-8 py-4 text-base min-h-[52px]',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(loading);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleClick = async () => {
    if (disabled || isLoading || showSuccess || !onClick) return;

    try {
      setIsLoading(true);
      const result = onClick();
      if (result instanceof Promise) {
        await result;
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
  const widthStyles = fullWidth ? 'w-full' : 'inline-flex';

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading || showSuccess}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} items-center justify-center gap-2 ${className}`}
    >
      {isLoading && !showSuccess && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}

      {showSuccess && (
        <svg
          className="w-5 h-5 animate-fade-in"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}

      {!showSuccess && (
        <span className={`flex items-center gap-2 transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </span>
      )}
    </button>
  );
}
