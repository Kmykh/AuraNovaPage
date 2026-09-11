"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  /** Mode: single date or date range */
  mode?: 'single' | 'range';
  /** Selected date (YYYY-MM-DD) for single mode */
  value?: string;
  /** For range mode: start date */
  rangeStart?: string;
  /** For range mode: end date */
  rangeEnd?: string;
  /** Called when a date is clicked (single mode) */
  onChange?: (date: string) => void;
  /** Called when range changes (range mode) */
  onChangeRange?: (start: string, end: string) => void;
  /** Min selectable date (YYYY-MM-DD) */
  min?: string;
  /** Max selectable date (YYYY-MM-DD) */
  max?: string;
  /** Label above the calendar */
  label?: string;
  /** Accent color class (default gold) */
  accentColor?: 'gold' | 'amber' | 'rose';
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function CalendarPicker({
  mode = 'single',
  value,
  rangeStart,
  rangeEnd,
  onChange,
  onChangeRange,
  min,
  max,
  label,
  accentColor = 'gold',
}: CalendarPickerProps) {
  const initialDate = parseDate(value || rangeStart || '') || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;

  // Accent styles
  const accents = {
    gold: {
      selected: 'bg-[#4a3933] text-white shadow-lg',
      range: 'bg-[#4a3933]/10',
      rangeEdge: 'bg-[#4a3933] text-white',
      today: 'ring-2 ring-[#c8a96b]',
      hover: 'hover:bg-[#4a3933]/10',
      header: 'text-[#4a3933]',
    },
    amber: {
      selected: 'bg-amber-600 text-white shadow-lg',
      range: 'bg-amber-100',
      rangeEdge: 'bg-amber-600 text-white',
      today: 'ring-2 ring-amber-400',
      hover: 'hover:bg-amber-50',
      header: 'text-amber-800',
    },
    rose: {
      selected: 'bg-rose-600 text-white shadow-lg',
      range: 'bg-rose-100',
      rangeEdge: 'bg-rose-600 text-white',
      today: 'ring-2 ring-rose-400',
      hover: 'hover:bg-rose-50',
      header: 'text-rose-800',
    },
  };
  const ac = accents[accentColor];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDateClick = (dateStr: string) => {
    if (mode === 'single') {
      onChange?.(dateStr);
    } else if (mode === 'range' && onChangeRange) {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start a new range
        onChangeRange(dateStr, '');
      } else if (rangeStart && !rangeEnd) {
        // Finish range or restart if earlier
        const start = parseDate(rangeStart)!;
        const clicked = parseDate(dateStr)!;
        if (clicked < start) {
          onChangeRange(dateStr, '');
        } else {
          onChangeRange(rangeStart, dateStr);
        }
      }
    }
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false, dateStr: toDateStr(y, m, d) });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true, dateStr: toDateStr(viewYear, viewMonth, d) });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false, dateStr: toDateStr(y, m, d) });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const isDisabled = (dateStr: string) => {
    if (minDate && parseDate(dateStr)! < minDate) return true;
    if (maxDate && parseDate(dateStr)! > maxDate) return true;
    return false;
  };

  const isInRange = (dateStr: string) => {
    if (mode === 'single') return false;
    if (!rangeStart || !rangeEnd) return false;
    const d = parseDate(dateStr)!;
    const s = parseDate(rangeStart)!;
    const e = parseDate(rangeEnd)!;
    return d > s && d < e;
  };

  const isRangeEdge = (dateStr: string) => {
    if (mode === 'single') return false;
    return dateStr === rangeStart || dateStr === rangeEnd;
  };

  return (
    <div className="w-full transition-all duration-300">
      {label && (
        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${ac.header}`}>{label}</p>
      )}
      <div className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden p-5">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={prevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-sage/10 transition-colors text-sage hover:text-brown"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className={`text-base font-serif font-bold ${ac.header} capitalize`}>
            {MONTHS_ES[viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-sage/10 transition-colors text-sage hover:text-brown"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS_ES.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-sage/60 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((cell, idx) => {
            const isSelected = mode === 'single' && cell.dateStr === value;
            const isEdge = isRangeEdge(cell.dateStr);
            const inRange = isInRange(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const disabled = isDisabled(cell.dateStr);

            return (
              <div key={idx} className={`relative flex items-center justify-center ${inRange ? ac.range : ''}`}>
                {inRange && (
                  <div className={`absolute inset-y-0 inset-x-0 ${ac.range} scale-x-110`} />
                )}
                <button
                  type="button"
                  disabled={disabled || !cell.isCurrentMonth}
                  onClick={() => handleDateClick(cell.dateStr)}
                  className={`
                    relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ease-in-out
                    ${!cell.isCurrentMonth ? 'text-sage/25 cursor-default' : ''}
                    ${cell.isCurrentMonth && !isSelected && !isEdge && !disabled ? `text-brown ${ac.hover} cursor-pointer` : ''}
                    ${isSelected || isEdge ? `${ac.selected} scale-110 shadow-md` : ''}
                    ${isToday && !isSelected && !isEdge && cell.isCurrentMonth ? ac.today : ''}
                    ${disabled && cell.isCurrentMonth ? 'text-sage/25 cursor-not-allowed' : ''}
                  `}
                >
                  {cell.day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
