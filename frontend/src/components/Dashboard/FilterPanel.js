import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const FilterPanel = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    risk: true,
    altitude: true,
    status: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (category, value, checked) => {
    const currentValues = filters[category] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFiltersChange({
      ...filters,
      [category]: newValues
    });
  };

  const handleRangeChange = (category, field, value) => {
    onFiltersChange({
      ...filters,
      [category]: {
        ...filters[category],
        [field]: value
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: [],
      risk: [],
      status: [],
      altitude: { min: 0, max: 50000 },
      operator: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type?.length > 0) count += filters.type.length;
    if (filters.risk?.length > 0) count += filters.risk.length;
    if (filters.status?.length > 0) count += filters.status.length;
    if (filters.operator?.length > 0) count += 1;
    if (filters.altitude?.min > 0 || filters.altitude?.max < 50000) count += 1;
    return count;
  };

  const FilterSection = ({ title, children, section }) => (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-lighter/30 transition-colors"
      >
        <span className="font-medium text-white">{title}</span>
        {expandedSections[section] ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CheckboxFilter = ({ options, category }) => (
    <div className="space-y-2">
      {options.map(option => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters[category]?.includes(option.value) || false}
            onChange={(e) => handleFilterChange(category, option.value, e.target.checked)}
            className="w-4 h-4 text-neon-blue bg-dark-lighter border-gray-600 rounded focus:ring-neon-blue focus:ring-2"
          />
          <span className="text-sm text-gray-300">{option.label}</span>
          {option.count && (
            <span className="text-xs text-gray-500">({option.count})</span>
          )}
        </label>
      ))}
    </div>
  );

  const typeOptions = [
    { value: 'satellite', label: 'Satellites', count: 8420 },
    { value: 'debris', label: 'Debris', count: 5890 },
    { value: 'rocket', label: 'Rocket Bodies', count: 216 }
  ];

  const riskOptions = [
    { value: 'critical', label: 'Critical', count: 12 },
    { value: 'high', label: 'High', count: 63 },
    { value: 'medium', label: 'Medium', count: 284 },
    { value: 'low', label: 'Low', count: 14167 }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', count: 8420 },
    { value: 'inactive', label: 'Inactive', count: 6106 }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 glass-button px-4 py-2 w-full justify-center"
        >
          <FunnelIcon className="w-4 h-4" />
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-neon-blue text-dark px-2 py-1 rounded-full text-xs font-bold">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed md:relative inset-y-0 left-0 z-40 w-80 md:w-full bg-dark-card md:bg-transparent border-r border-gray-700 md:border-r-0"
          >
            <div className="glass-card h-full md:h-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 text-neon-blue" />
                  <h3 className="font-semibold text-white">Filters</h3>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-neon-blue text-dark px-2 py-1 rounded-full text-xs font-bold">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={onToggle}
                    className="md:hidden text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Sections */}
              <div className="overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-none">
                {/* Object Type Filter */}
                <FilterSection title="Object Type" section="type">
                  <CheckboxFilter options={typeOptions} category="type" />
                </FilterSection>

                {/* Risk Level Filter */}
                <FilterSection title="Risk Level" section="risk">
                  <CheckboxFilter options={riskOptions} category="risk" />
                </FilterSection>

                {/* Status Filter */}
                <FilterSection title="Status" section="status">
                  <CheckboxFilter options={statusOptions} category="status" />
                </FilterSection>

                {/* Altitude Range Filter */}
                <FilterSection title="Altitude Range" section="altitude">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Minimum Altitude (km)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="100"
                        value={filters.altitude?.min || 0}
                        onChange={(e) => handleRangeChange('altitude', 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 km</span>
                        <span className="text-neon-blue font-medium">
                          {filters.altitude?.min || 0} km
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Maximum Altitude (km)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="100"
                        value={filters.altitude?.max || 50000}
                        onChange={(e) => handleRangeChange('altitude', 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span className="text-neon-blue font-medium">
                          {filters.altitude?.max || 50000} km
                        </span>
                        <span>50,000 km</span>
                      </div>
                    </div>
                  </div>
                </FilterSection>

                {/* Operator Filter */}
                <FilterSection title="Operator" section="operator">
                  <div>
                    <input
                      type="text"
                      placeholder="Search operators..."
                      value={filters.operator || ''}
                      onChange={(e) => onFiltersChange({ ...filters, operator: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                    />
                  </div>
                </FilterSection>
              </div>

              {/* Quick Filters */}
              <div className="p-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onFiltersChange({ ...filters, risk: ['critical', 'high'] })}
                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                  >
                    High Risk Only
                  </button>
                  <button
                    onClick={() => onFiltersChange({ ...filters, type: ['satellite'], status: ['active'] })}
                    className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                  >
                    Active Satellites
                  </button>
                  <button
                    onClick={() => onFiltersChange({ ...filters, type: ['debris'] })}
                    className="px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full hover:bg-orange-500/30 transition-colors"
                  >
                    Debris Only
                  </button>
                  <button
                    onClick={() => onFiltersChange({ ...filters, altitude: { min: 0, max: 2000 } })}
                    className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                  >
                    LEO Objects
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default FilterPanel;