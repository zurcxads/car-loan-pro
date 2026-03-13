"use client";

import { useState, useEffect, useRef } from 'react';
import topEmployers from '@/data/top-employers.json';
import { Building2, ChevronDown } from 'lucide-react';

interface EmployerAutocompleteProps {
  value: string;
  onEmployerSelect: (employer: string) => void;
  placeholder?: string;
  className?: string;
}

export default function EmployerAutocomplete({
  value,
  onEmployerSelect,
  placeholder = 'Enter employer name...',
  className = '',
}: EmployerAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fuzzy match search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        const searchTerm = inputValue.toLowerCase();

        // Fuzzy matching: matches if search term appears anywhere in employer name
        const filtered = (topEmployers as string[]).filter((employer) =>
          employer.toLowerCase().includes(searchTerm)
        );

        // Sort by relevance (starts with > contains)
        const sorted = filtered.sort((a, b) => {
          const aStarts = a.toLowerCase().startsWith(searchTerm);
          const bStarts = b.toLowerCase().startsWith(searchTerm);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        });

        setMatches(sorted.slice(0, 10)); // Limit to 10 results
        setIsOpen(sorted.length > 0);
      } else {
        setMatches([]);
        setIsOpen(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (employer: string) => {
    setInputValue(employer);
    onEmployerSelect(employer);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < matches.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && matches[selectedIndex]) {
          handleSelect(matches[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      // If user typed something that's not in the list, still accept it
      if (inputValue && !matches.includes(inputValue)) {
        onEmployerSelect(inputValue);
      }
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (matches.length > 0) setIsOpen(true);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${className}
          `}
        />
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {isOpen && matches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {matches.map((employer, index) => (
            <button
              key={`${employer}-${index}`}
              onClick={() => handleSelect(employer)}
              className={`
                w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors
                ${index === selectedIndex ? 'bg-blue-50' : ''}
                ${index > 0 ? 'border-t border-gray-100' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{employer}</p>
                <Building2 className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}

          {/* "Other" option always at the bottom */}
          <button
            onClick={() => handleSelect('Other')}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-200"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 italic">
                Other (not listed)
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
