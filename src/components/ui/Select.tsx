import React, { SelectHTMLAttributes, forwardRef, useId } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, helperText, error, id, options, placeholder, ...props }, ref) => {
    const defaultId = useId();
    const selectId = id || defaultId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-brown">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`
            flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-brown
            transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50
            appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]
            ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-sage/30'}
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A9678' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`
          }}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
Select.displayName = 'Select';
