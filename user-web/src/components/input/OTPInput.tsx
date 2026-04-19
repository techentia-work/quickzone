'use client';
import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function OTPInput({ 
  value, 
  onChange, 
  length = 6, 
  disabled = false,
  error,
  className = ""
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const sanitized = inputValue.replace(/\D/g, '');
    
    if (sanitized === '') {
      // Handle deletion
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
      return;
    }

    // Handle single digit input
    if (sanitized.length === 1) {
      const newValue = value.split('');
      newValue[index] = sanitized;
      onChange(newValue.join(''));

      // Move to next input
      if (index < length - 1) {
        focusInput(index + 1);
      }
    } 
    // Handle paste of multiple digits
    else if (sanitized.length > 1) {
      const digits = sanitized.slice(0, length).split('');
      const newValue = value.split('');
      
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newValue[index + i] = digit;
        }
      });
      
      onChange(newValue.join(''));
      
      // Focus the next empty input or last input
      const nextIndex = Math.min(index + digits.length, length - 1);
      focusInput(nextIndex);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous
        focusInput(index - 1);
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    } else if (e.key === 'Delete') {
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    
    if (pastedData) {
      const digits = pastedData.slice(0, length);
      onChange(digits);
      
      // Focus last filled input
      const lastIndex = Math.min(digits.length, length) - 1;
      focusInput(lastIndex);
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {(inputRefs.current[index] = el)}}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              w-12 h-12 text-center text-lg font-semibold
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error 
                ? 'border-red-500 text-red-600' 
                : 'border-gray-300 focus:border-blue-500'
              }
              ${value[index] ? 'border-blue-400' : ''}
            `}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}