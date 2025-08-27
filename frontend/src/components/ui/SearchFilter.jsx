import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SearchFilter = ({
  onSearch,
  onFilter,
  placeholder = "Search...",
  filters = [],
  className,
  debounceMs = 300
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceMs]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters };
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onFilter?.({});
    onSearch?.('');
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors",
            showFilters 
              ? "text-primary-600 bg-primary-50" 
              : "text-gray-400 hover:text-gray-600"
          )}
          aria-label="Toggle filters"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {Object.entries(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 py-1">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const option = filter?.options.find(o => o.value === value);
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                <span className="font-medium">{filter?.label}:</span>
                <span>{option?.label || value}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:text-primary-900 ml-1"
                  aria-label={`Remove ${filter?.label} filter`}
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export { SearchFilter };