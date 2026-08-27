import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-widest text-[#887870] ml-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            flex h-13 w-full rounded-2xl border border-[#e8dcdc]/80 bg-white px-5 py-3 text-sm text-[#4a3933] font-medium placeholder:text-[#887870]/40 shadow-sm
            transition-all hover:border-[#d38b8b]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d38b8b]/15 focus:border-[#d38b8b]/60 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-400 focus-visible:ring-red-400' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-[13px] font-medium text-red-500">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[13px] text-sage">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
