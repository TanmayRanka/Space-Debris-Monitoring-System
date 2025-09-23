import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Rockets = () => {
  const [rockets, setRockets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    agency: [],
    mission: [],
    dateRange: { start: '', end: '' }
  });
  const [sortBy, setSortBy] = useState('launchDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load rocket data
  useEffect(() => {
    const loadRockets = async () => {
      try {
        // Mock data - replace with actual API call
        const mockRockets = generateMockRockets();
        setRockets(mockRockets);
      } catch (error) {
        console.error('Failed to load rockets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRockets();
  }, []);

  // Generate mock rocket data
  const generateMockRockets = () => {
    const agencies = ['SpaceX', 'NASA', 'ESA', 'ISRO', 'CNSA', 'Roscosmos', 'Blue Origin'];
    const statuses = ['active', 'deorbited', 'failed', 'planned'];
    const missions = ['ISS Resupply', 'Satellite Deployment', 'Crew Transport', 'Deep Space', 'Commercial'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `R-${(i + 1).toString().padStart(4, '0')}`,
      name: `Rocket ${i + 1}`,
      agency: agencies[Math.floor(Math.random() * agencies.length)],
      mission: missions[Math.floor(Math.random() * missions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      launchDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      altitude: Math.random() * 1000 + 200,
      velocity: Math.random() * 3 + 7,
      mass: Math.random() * 500 + 100,
      payload: Math.random() * 20 + 5,
      orbit: ['LEO', 'MEO', 'GEO', 'HEO'][Math.floor(Math.random() * 4)],
      inclination: Math.random() * 180,
      apogee: Math.random() * 1000 + 400,
      perigee: Math.random() * 500 + 200,
      riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    }));
  };

  // Filter and sort rockets
  const filteredRockets = useMemo(() => {
    let filtered = [...rockets];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(rocket =>
        rocket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rocket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rocket.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rocket.mission.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status.length > 0) {
      filtered = filtered.filter(rocket => filters.status.includes(rocket.status));
    }

    if (filters.agency.length > 0) {
      filtered = filtered.filter(rocket => filters.agency.includes(rocket.agency));
    }

    if (filters.mission.length > 0) {
      filtered = filtered.filter(rocket => filters.mission.includes(rocket.mission));
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(rocket => 
        new Date(rocket.launchDate) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(rocket => 
        new Date(rocket.launchDate) <= new Date(filters.dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'launchDate') {
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
  }, [rockets, searchQuery, filters, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportData = (format) => {
    const dataToExport = filteredRockets.map(rocket => ({
      ID: rocket.id,
      Name: rocket.name,
      Agency: rocket.agency,
      Mission: rocket.mission,
      Status: rocket.status,
      'Launch Date': rocket.launchDate.toISOString().split('T')[0],
      'Altitude (km)': rocket.altitude.toFixed(1),
      'Velocity (km/s)': rocket.velocity.toFixed(2),
      'Mass (kg)': rocket.mass.toFixed(0),
      'Payload (tons)': rocket.payload.toFixed(1),
      Orbit: rocket.orbit,
      'Risk Level': rocket.riskLevel
    }));

    if (format === 'csv') {
      const csv = convertToCSV(dataToExport);
      downloadFile(csv, 'rockets.csv', 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, 'rockets.json', 'application/json');
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
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'deorbited':
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'planned':
        return <CalendarIcon className="w-4 h-4 text-blue-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'deorbited':
        return 'text-gray-400 bg-gray-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      case 'planned':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-600/30 rounded w-64"></div>
            <div className="h-12 bg-gray-600/20 rounded"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-600/20 rounded"></div>
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
            <RocketLaunchIcon className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-3xl font-bold text-white">Rocket Bodies</h1>
              <p className="text-gray-400">Monitor and track rocket stages and bodies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-400">Total: </span>
              <span className="text-lg font-bold text-neon-blue">{filteredRockets.length}</span>
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
                placeholder="Search rockets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <option value="active">Active</option>
                      <option value="deorbited">Deorbited</option>
                      <option value="failed">Failed</option>
                      <option value="planned">Planned</option>
                    </select>
                  </div>

                  {/* Agency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Agency</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, agency: values }));
                      }}
                    >
                      <option value="SpaceX">SpaceX</option>
                      <option value="NASA">NASA</option>
                      <option value="ESA">ESA</option>
                      <option value="ISRO">ISRO</option>
                      <option value="CNSA">CNSA</option>
                      <option value="Roscosmos">Roscosmos</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Launch Date From</label>
                    <input
                      type="date"
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Launch Date To</label>
                    <input
                      type="date"
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ status: [], agency: [], mission: [], dateRange: { start: '', end: '' } })}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rockets Table */}
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
                      <span>Rocket</span>
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('agency')}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white"
                    >
                      <span>Agency</span>
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('launchDate')}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white"
                    >
                      <span>Launch Date</span>
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Orbit</th>
                  <th className="px-6 py-4 text-left">Risk</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredRockets.map((rocket, index) => (
                    <motion.tr
                      key={rocket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-dark-lighter/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <RocketLaunchIcon className="w-5 h-5 text-neon-blue" />
                          <div>
                            <div className="text-white font-medium">{rocket.name}</div>
                            <div className="text-sm text-gray-400">{rocket.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{rocket.agency}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {rocket.launchDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(rocket.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rocket.status)}`}>
                            {rocket.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{rocket.orbit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rocket.riskLevel)}`}>
                          {rocket.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRocket(rocket)}
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

        {/* Rocket Detail Modal */}
        <AnimatePresence>
          {selectedRocket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedRocket(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">{selectedRocket.name}</h3>
                  <button
                    onClick={() => setSelectedRocket(null)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rocket ID:</span>
                        <span className="text-white font-mono">{selectedRocket.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Agency:</span>
                        <span className="text-white">{selectedRocket.agency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mission:</span>
                        <span className="text-white">{selectedRocket.mission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Launch Date:</span>
                        <span className="text-white">{selectedRocket.launchDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedRocket.status)}`}>
                          {selectedRocket.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">Orbital Parameters</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Altitude:</span>
                        <span className="text-white">{selectedRocket.altitude.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Velocity:</span>
                        <span className="text-white">{selectedRocket.velocity.toFixed(2)} km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Orbit Type:</span>
                        <span className="text-white">{selectedRocket.orbit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inclination:</span>
                        <span className="text-white">{selectedRocket.inclination.toFixed(1)}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Apogee:</span>
                        <span className="text-white">{selectedRocket.apogee.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Perigee:</span>
                        <span className="text-white">{selectedRocket.perigee.toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="neon-button flex-1 py-2">
                    Track Rocket
                  </button>
                  <button className="glass-button flex-1 py-2">
                    View Trajectory
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

export default Rockets;