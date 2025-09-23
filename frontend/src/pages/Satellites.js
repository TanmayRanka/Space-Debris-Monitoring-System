import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  SignalIcon,
  BoltIcon,
  MapPinIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Satellites = () => {
  const [satellites, setSatellites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    operator: [],
    purpose: [],
    orbit: [],
    powerStatus: [],
    altitudeRange: { min: 0, max: 50000 }
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid

  // Load satellite data
  useEffect(() => {
    const loadSatellites = async () => {
      try {
        // Mock data - replace with actual API call
        const mockSatellites = generateMockSatellites();
        setSatellites(mockSatellites);
      } catch (error) {
        console.error('Failed to load satellites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSatellites();
  }, []);

  // Generate mock satellite data
  const generateMockSatellites = () => {
    const operators = ['NASA', 'ESA', 'SpaceX', 'OneWeb', 'Starlink', 'ISRO', 'CNSA', 'Roscosmos'];
    const purposes = ['Communication', 'Earth Observation', 'Navigation', 'Scientific', 'Military', 'Weather'];
    const orbits = ['LEO', 'MEO', 'GEO', 'HEO', 'SSO'];
    const statuses = ['operational', 'non-operational', 'partially-operational', 'unknown'];
    const powerStatuses = ['nominal', 'degraded', 'critical', 'off'];
    
    return Array.from({ length: 200 }, (_, i) => ({
      id: `SAT-${(i + 1).toString().padStart(4, '0')}`,
      name: `Satellite ${i + 1}`,
      operator: operators[Math.floor(Math.random() * operators.length)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      powerStatus: powerStatuses[Math.floor(Math.random() * powerStatuses.length)],
      launchDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 20),
      altitude: Math.random() * 35000 + 200,
      velocity: Math.random() * 3 + 7,
      mass: Math.random() * 5000 + 100,
      orbit: orbits[Math.floor(Math.random() * orbits.length)],
      inclination: Math.random() * 180,
      period: Math.random() * 1440 + 90,
      apogee: Math.random() * 1000 + 400,
      perigee: Math.random() * 500 + 200,
      signalStrength: Math.random() * 100,
      batteryLevel: Math.random() * 100,
      solarPanelEfficiency: Math.random() * 100,
      lastContact: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      nextPass: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));
  };

  // Filter and sort satellites
  const filteredSatellites = useMemo(() => {
    let filtered = [...satellites];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(satellite =>
        satellite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        satellite.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        satellite.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        satellite.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(satellite => filters.status.includes(satellite.status));
    }

    if (filters.operator.length > 0) {
      filtered = filtered.filter(satellite => filters.operator.includes(satellite.operator));
    }

    if (filters.purpose.length > 0) {
      filtered = filtered.filter(satellite => filters.purpose.includes(satellite.purpose));
    }

    if (filters.orbit.length > 0) {
      filtered = filtered.filter(satellite => filters.orbit.includes(satellite.orbit));
    }

    if (filters.powerStatus.length > 0) {
      filtered = filtered.filter(satellite => filters.powerStatus.includes(satellite.powerStatus));
    }

    // Altitude range filter
    filtered = filtered.filter(satellite => 
      satellite.altitude >= filters.altitudeRange.min && 
      satellite.altitude <= filters.altitudeRange.max
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'launchDate' || sortBy === 'lastContact' || sortBy === 'nextPass') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [satellites, searchQuery, filters, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportData = (format) => {
    const dataToExport = filteredSatellites.map(satellite => ({
      ID: satellite.id,
      Name: satellite.name,
      Operator: satellite.operator,
      Purpose: satellite.purpose,
      Status: satellite.status,
      'Power Status': satellite.powerStatus,
      'Launch Date': satellite.launchDate.toISOString().split('T')[0],
      'Altitude (km)': satellite.altitude.toFixed(1),
      'Velocity (km/s)': satellite.velocity.toFixed(2),
      'Mass (kg)': satellite.mass.toFixed(0),
      Orbit: satellite.orbit,
      'Signal Strength (%)': satellite.signalStrength.toFixed(1),
      'Battery Level (%)': satellite.batteryLevel.toFixed(1),
      'Risk Level': satellite.riskLevel
    }));

    if (format === 'csv') {
      const csv = convertToCSV(dataToExport);
      downloadFile(csv, 'satellites.csv', 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, 'satellites.json', 'application/json');
    }
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'non-operational':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'partially-operational':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-400 bg-green-500/20';
      case 'non-operational':
        return 'text-red-400 bg-red-500/20';
      case 'partially-operational':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPowerStatusColor = (powerStatus) => {
    switch (powerStatus) {
      case 'nominal':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      case 'off':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const SatelliteCard = ({ satellite }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 hover:bg-dark-lighter/30 transition-colors cursor-pointer"
      onClick={() => setSelectedSatellite(satellite)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <GlobeAltIcon className="w-5 h-5 text-neon-blue" />
          <div>
            <h3 className="font-medium text-white">{satellite.name}</h3>
            <p className="text-xs text-gray-400">{satellite.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(satellite.status)}`}>
          {satellite.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Operator:</span>
          <span className="text-gray-300">{satellite.operator}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Purpose:</span>
          <span className="text-gray-300">{satellite.purpose}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Altitude:</span>
          <span className="text-white">{satellite.altitude.toFixed(0)} km</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Signal:</span>
          <div className="flex items-center space-x-1">
            <SignalIcon className="w-3 h-3 text-neon-blue" />
            <span className="text-white">{satellite.signalStrength.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Battery:</span>
          <div className="flex items-center space-x-1">
            <BoltIcon className={`w-3 h-3 ${getPowerStatusColor(satellite.powerStatus)}`} />
            <span className="text-white">{satellite.batteryLevel.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-600/30 rounded w-64"></div>
            <div className="h-12 bg-gray-600/20 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-600/20 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-3xl font-bold text-white">Satellites</h1>
              <p className="text-gray-400">Monitor active and inactive satellite systems</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-400">Active: </span>
              <span className="text-lg font-bold text-green-400">
                {filteredSatellites.filter(s => s.status === 'operational').length}
              </span>
            </div>
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-400">Total: </span>
              <span className="text-lg font-bold text-neon-blue">{filteredSatellites.length}</span>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search satellites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-dark-lighter rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'table' ? 'bg-neon-blue text-dark' : 'text-gray-400'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid' ? 'bg-neon-blue text-dark' : 'text-gray-400'
                  }`}
                >
                  Grid
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-neon-blue text-dark' : 'glass-button'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 glass-button px-4 py-2">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => exportData('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-lighter rounded"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-lighter rounded"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-gray-700 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, status: values }));
                      }}
                    >
                      <option value="operational">Operational</option>
                      <option value="non-operational">Non-operational</option>
                      <option value="partially-operational">Partially Operational</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  {/* Operator Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Operator</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, operator: values }));
                      }}
                    >
                      <option value="NASA">NASA</option>
                      <option value="ESA">ESA</option>
                      <option value="SpaceX">SpaceX</option>
                      <option value="OneWeb">OneWeb</option>
                      <option value="Starlink">Starlink</option>
                      <option value="ISRO">ISRO</option>
                    </select>
                  </div>

                  {/* Purpose Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Purpose</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, purpose: values }));
                      }}
                    >
                      <option value="Communication">Communication</option>
                      <option value="Earth Observation">Earth Observation</option>
                      <option value="Navigation">Navigation</option>
                      <option value="Scientific">Scientific</option>
                      <option value="Military">Military</option>
                      <option value="Weather">Weather</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ 
                      status: [], 
                      operator: [], 
                      purpose: [], 
                      orbit: [], 
                      powerStatus: [], 
                      altitudeRange: { min: 0, max: 50000 } 
                    })}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Satellites Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredSatellites.map((satellite, index) => (
                <SatelliteCard key={satellite.id} satellite={satellite} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-lighter/50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 text-gray-400 hover:text-white"
                      >
                        <span>Satellite</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort('operator')}
                        className="flex items-center space-x-1 text-gray-400 hover:text-white"
                      >
                        <span>Operator</span>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">Purpose</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Altitude</th>
                    <th className="px-6 py-4 text-left">Signal</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <AnimatePresence>
                    {filteredSatellites.map((satellite, index) => (
                      <motion.tr
                        key={satellite.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="hover:bg-dark-lighter/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <GlobeAltIcon className="w-5 h-5 text-neon-blue" />
                            <div>
                              <div className="text-white font-medium">{satellite.name}</div>
                              <div className="text-sm text-gray-400">{satellite.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{satellite.operator}</td>
                        <td className="px-6 py-4 text-gray-300">{satellite.purpose}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(satellite.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(satellite.status)}`}>
                              {satellite.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{satellite.altitude.toFixed(0)} km</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <SignalIcon className="w-4 h-4 text-neon-blue" />
                            <span className="text-white">{satellite.signalStrength.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedSatellite(satellite)}
                            className="text-neon-blue hover:text-neon-purple transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Satellite Detail Modal */}
        <AnimatePresence>
          {selectedSatellite && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedSatellite(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">{selectedSatellite.name}</h3>
                  <button
                    onClick={() => setSelectedSatellite(null)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Satellite ID:</span>
                        <span className="text-white font-mono">{selectedSatellite.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operator:</span>
                        <span className="text-white">{selectedSatellite.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Purpose:</span>
                        <span className="text-white">{selectedSatellite.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Launch Date:</span>
                        <span className="text-white">{selectedSatellite.launchDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedSatellite.status)}`}>
                          {selectedSatellite.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">Orbital Parameters</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Altitude:</span>
                        <span className="text-white">{selectedSatellite.altitude.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Velocity:</span>
                        <span className="text-white">{selectedSatellite.velocity.toFixed(2)} km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orbit Type:</span>
                        <span className="text-white">{selectedSatellite.orbit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inclination:</span>
                        <span className="text-white">{selectedSatellite.inclination.toFixed(1)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Period:</span>
                        <span className="text-white">{selectedSatellite.period.toFixed(1)} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">System Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Signal Strength:</span>
                        <span className="text-white">{selectedSatellite.signalStrength.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Battery Level:</span>
                        <span className="text-white">{selectedSatellite.batteryLevel.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Solar Efficiency:</span>
                        <span className="text-white">{selectedSatellite.solarPanelEfficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Contact:</span>
                        <span className="text-white">{selectedSatellite.lastContact.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Pass:</span>
                        <span className="text-white">{selectedSatellite.nextPass.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="neon-button flex-1 py-2">
                    Track Satellite
                  </button>
                  <button className="glass-button flex-1 py-2">
                    Communication Log
                  </button>
                  <button className="glass-button flex-1 py-2">
                    Telemetry Data
                  </button>
                  <button className="glass-button flex-1 py-2">
                    Generate Report
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Satellites;