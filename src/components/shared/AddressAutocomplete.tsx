"use client";

import { useState, useEffect, useRef } from 'react';
import usCities from '@/data/us-cities.json';
import { MapPin, ChevronDown } from 'lucide-react';

interface City {
  city: string;
  state: string;
  zip: string;
}

interface AddressAutocompleteProps {
  value: string;
  onCitySelect: (city: string, state: string, zip: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onCitySelect,
  placeholder = 'Enter city name...',
  className = '',
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<City[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        const searchTerm = inputValue.toLowerCase();
        const filtered = (usCities as City[]).filter((c) =>
          c.city.toLowerCase().startsWith(searchTerm)
        );
        setMatches(filtered.slice(0, 10)); // Limit to 10 results
        setIsOpen(filtered.length > 0);
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

  const handleSelect = (city: City) => {
    setInputValue(city.city);
    onCitySelect(city.city, city.state, city.zip);
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
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${className}
          `}
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {isOpen && matches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto"
        >
          {matches.map((city, index) => (
            <button
              key={`${city.city}-${city.state}-${index}`}
              onClick={() => handleSelect(city)}
              className={`
                w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors
                ${index === selectedIndex ? 'bg-blue-50' : ''}
                ${index > 0 ? 'border-t border-gray-100' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {city.city}, {city.state}
                  </p>
                  <p className="text-xs text-gray-500">ZIP: {city.zip}</p>
                </div>
                <MapPin className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
