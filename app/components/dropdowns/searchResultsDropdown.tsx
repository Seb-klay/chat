// components/SearchResultsDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { SearxngSearchResult } from 'searxng';
import { getFaviconUrl, getDomainFromUrl } from '../dialogs/searchResultsDisplay';

interface SearchResultsDropdownProps {
  results: SearxngSearchResult[];
  onResultClick?: (result: SearxngSearchResult) => void;
  className?: string;
  maxVisible?: number;
  buttonText?: string;
  theme?: any;
}

export default function SearchResultsDropdown({
  results,
  onResultClick,
  className = '',
  maxVisible = 3,
  buttonText = 'more results',
  theme,
}: SearchResultsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenResults = results.slice(maxVisible);

  if (results.length <= maxVisible) {
    return null;
  }

  // Calculate position for fixed positioning
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleResultClick = (result: SearxngSearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block overflow-visible opacity-100 ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        className="text-xs text-blue-600 hover:underline transition-colors duration-200 font-medium"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        +{hiddenResults.length} {buttonText}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Invisible bridge to keep hover active */}
          <div
            className="fixed z-9998"
            style={{
              top: position.top + 10,
              left: position.left - 60,
              width: 120,
              height: 20,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className="fixed rounded-xl shadow-2xl p-3 z-9999 transition-all duration-200"
            style={{
              top: position.top - 10,
              left: window.innerWidth < 1024 ? '50%' : position.left,
              transform: 'translateX(-50%) translateY(-100%)',
              width: 'min(420px, 90vw)',
              maxHeight: 'min(500px, 70vh)',
              backgroundColor: theme.colors.background_second,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {hiddenResults.length} more results
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close dropdown"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 opacity-100 md:grid-cols-2 gap-2 overflow-y-auto max-h-[calc(70vh-80px)]">
              {hiddenResults.map((result, index) => (
                <a
                  key={result.url || index}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-2.5 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 cursor-pointer"
                  style={{
                    backgroundColor: theme?.colors?.tertiary_background,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleResultClick(result);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <img
                      src={getFaviconUrl(result.url)}
                      alt=""
                      className="w-4 h-4 mt-0.5 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getDomainFromUrl(result.url)}
                      </div>
                      <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                        {result.title || "Untitled"}
                      </h3>
                      {result.content && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {result.content.substring(0, 80)}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            {hiddenResults.length > 6 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <button
                  className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:underline py-1"
                  onClick={() => setIsOpen(false)}
                >
                  View all {hiddenResults.length} results →
                </button>
              </div>
            )}

            {/* Pointer Triangle */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 transform rotate-45"
              style={{
                backgroundColor: theme.colors.background_second,
              }}
              aria-hidden="true"
            />
          </div>
        </>
      )}
    </div>
  );
}