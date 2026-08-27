import React, { TextareaHTMLAttributes, forwardRef, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const defaultId = useId();
    const textareaId = id || defaultId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-brown">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`
            flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-brown placeholder:text-sage/50
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50
            resize-y
            ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-sage/30'}
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
Textarea.displayName = 'Textarea';
