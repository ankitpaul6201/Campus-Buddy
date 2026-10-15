import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Custom App-Styled Dropdown List (replaces plain native <select>)
function CustomDropdown({ value, options, onChange, minWidth = '130px' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll selected item into view when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="py-1 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-2xs"
      >
        <span>{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#1944F1]' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div 
          ref={listRef}
          style={{ minWidth }}
          className="absolute top-full left-0 mt-1.5 max-h-52 bg-white rounded-2xl shadow-xl border border-slate-100/90 py-1.5 px-1 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150 no-scrollbar"
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                data-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors my-0.5 select-none ${
                  isSelected
                    ? 'bg-[#1944F1] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-[#1944F1] font-medium'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className = '',
  captionLayout = 'dropdown',
  fromYear = 1970,
  toYear = new Date().getFullYear(),
  ...props
}) {
  // Normalize initial selected date
  const parsedSelected = selected ? (selected instanceof Date ? selected : new Date(selected)) : null;
  const isValidDate = parsedSelected && !isNaN(parsedSelected.getTime());

  const [currentMonth, setCurrentMonth] = useState(() => {
    return isValidDate ? parsedSelected.getMonth() : new Date().getMonth();
  });

  const [currentYear, setCurrentYear] = useState(() => {
    return isValidDate ? parsedSelected.getFullYear() : new Date().getFullYear();
  });

  // Sync when selected date externally updates
  useEffect(() => {
    if (isValidDate) {
      setCurrentMonth(parsedSelected.getMonth());
      setCurrentYear(parsedSelected.getFullYear());
    }
  }, [selected]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      if (currentYear > fromYear) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      }
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      if (currentYear < toYear) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      }
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (dayNumber) => {
    const newDate = new Date(currentYear, currentMonth, dayNumber, 12, 0, 0);
    if (onSelect) {
      onSelect(newDate);
    }
  };

  // Month options for dropdown
  const monthOptions = MONTH_NAMES.map((name, idx) => ({
    value: idx,
    label: name
  }));

  // Year options for dropdown
  const yearOptions = [];
  for (let y = toYear; y >= fromYear; y--) {
    yearOptions.push({
      value: y,
      label: String(y)
    });
  }

  // Days in month calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Today
  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  return (
    <div className={`calendar-ui bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs font-sans select-none relative ${className}`} {...props}>
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {captionLayout === 'dropdown' ? (
          <div className="flex items-center gap-2 flex-1">
            {/* Custom Month Dropdown */}
            <CustomDropdown
              value={currentMonth}
              options={monthOptions}
              onChange={(newMonth) => setCurrentMonth(Number(newMonth))}
              minWidth="135px"
            />

            {/* Custom Year Dropdown */}
            <CustomDropdown
              value={currentYear}
              options={yearOptions}
              onChange={(newYear) => setCurrentYear(Number(newYear))}
              minWidth="100px"
            />
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-900 px-1">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        )}

        {/* Prev / Next Month Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#1944F1] flex items-center justify-center transition-all active:scale-95 border border-slate-200/60 shadow-2xs"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#1944F1] flex items-center justify-center transition-all active:scale-95 border border-slate-200/60 shadow-2xs"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_OF_WEEK.map((day, i) => (
          <div key={i} className="text-[10px] font-semibold text-slate-400 py-1 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty padding cells for first day of week */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8 w-8" />
        ))}

        {/* Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const isSelected =
            isValidDate &&
            parsedSelected.getFullYear() === currentYear &&
            parsedSelected.getMonth() === currentMonth &&
            parsedSelected.getDate() === dayNum;

          const isToday = isCurrentMonthToday && today.getDate() === dayNum;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleDayClick(dayNum)}
              className={`h-8 w-8 mx-auto rounded-xl text-xs flex items-center justify-center transition-all select-none active:scale-95 ${
                isSelected
                  ? 'bg-[#1944F1] text-white font-bold shadow-xs shadow-blue-500/25 ring-2 ring-blue-500/30'
                  : isToday
                  ? 'bg-blue-50 text-[#1944F1] font-bold border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-[#1944F1] font-medium'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
