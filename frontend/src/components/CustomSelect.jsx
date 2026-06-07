import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';

const CustomSelect = ({ value, onChange, options, className = '', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (disabled) return;
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-[#16161a]/80 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-700 focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate">{selectedOption?.label || selectedOption?.value}</span>
        <ChevronDownIcon className={`h-4 w-4 text-zinc-400 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-full min-w-[180px] origin-top-right rounded-lg border border-zinc-800 bg-[#0d0d11] p-1 shadow-xl shadow-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <CheckIcon className="h-3.5 w-3.5 text-white ml-2 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
