import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Components
import StatsCard from '../components/Dashboard/StatsCard';
import ObjectList from '../components/Dashboard/ObjectList';
import FilterPanel from '../components/Dashboard/FilterPanel';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({
    totalObjects: 0,
    activeSatellites: 0,
    debrisCount: 0,
    highRiskCollisions: 0,
    lastUpdate: null
  });
  
  const [objects, setObjects] = useState([]);
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'satellite', 'debris', 'rocket'
    altitude: { min: 0, max: 2000 },
    risk: 'all', // 'all', 'low', 'medium', 'high', 'critical'
    status: 'all' // 'all', 'active', 'inactive'
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls - replace with actual endpoints
      const [statsResponse, objectsResponse] = await Promise.all([
        fetch('/api/stats').catch(() => ({ ok: false })),
        fetch('/api/debris').catch(() => ({ ok: false }))
      ]);

      // Mock data for development
      const mockStats = {
        totalObjects: 14526,
        activeSatellites: 4832,
        debrisCount: 9694,
        highRiskCollisions: 75,
        lastUpdate: new Date().toISOString()
      };

      const mockObjects = [
        {
          id: 'SAT-001',
          name: 'ISS (ZARYA)',
          type: 'satellite',
          altitude: 408,
          inclination: 51.6,
          status: 'active',
          risk: 'low',
          operator: 'NASA/Roscosmos',
          launchDate: '1998-11-20',
          position: { lat: 45.0, lng: -75.0 },
          velocity: 7.66
        },
        {
          id: 'DEB-001',
          name: 'Cosmos 2251 Debris',
          type: 'debris',
          altitude: 790,
          inclination: 74.0,
          status: 'inactive',
          risk: 'high',
          operator: 'Russia',
          launchDate: '1993-06-16',
          position: { lat: 62.5, lng: 45.2 },
          velocity: 7.45
        },
        {
          id: 'SAT-002',
          name: 'Starlink-1007',
          type: 'satellite',
          altitude: 550,
          inclination: 53.0,
          status: 'active',
          risk: 'medium',
          operator: 'SpaceX',
          launchDate: '2020-01-29',
          position: { lat: -23.5, lng: 120.8 },
          velocity: 7.59
        },
        {
          id: 'ROC-001',
          name: 'Falcon 9 R/B',
          type: 'rocket',
          altitude: 300,
          inclination: 28.5,
          status: 'inactive',
          risk: 'low',
          operator: 'SpaceX',
          launchDate: '2023-03-15',
          position: { lat: 28.5, lng: -80.6 },
          velocity: 7.73
        },
        {
          id: 'DEB-002',
          name: 'Fengyun-1C Debris',
          type: 'debris',
          altitude: 850,
          inclination: 98.9,
          status: 'inactive',
          risk: 'critical',
          operator: 'China',
          launchDate: '1999-05-10',
          position: { lat: -45.2, lng: 165.3 },
          velocity: 7.42
        }
      ];

      setStats(mockStats);
      setObjects(mockObjects);
      setFilteredObjects(mockObjects);
      setLastUpdate(new Date());

      // Add notification for high-risk objects
      const highRiskObjects = mockObjects.filter(obj => obj.risk === 'critical' || obj.risk === 'high');
      if (highRiskObjects.length > 0) {
        toast.error(`High Risk Objects Detected: ${highRiskObjects.length} objects require immediate attention`, {
          duration: 5000,
          position: 'top-right'
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter objects based on current filters
  useEffect(() => {
    let filtered = objects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.operator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(obj => obj.type === filters.type);
    }

    // Altitude filter
    filtered = filtered.filter(obj =>
      obj.altitude >= filters.altitude.min && obj.altitude <= filters.altitude.max
    );

    // Risk filter
    if (filters.risk !== 'all') {
      filtered = filtered.filter(obj => obj.risk === filters.risk);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(obj => obj.status === filters.status);
    }

    setFilteredObjects(filtered);
  }, [objects, searchQuery, filters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Data refreshed successfully');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 min-h-full bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mission Control Dashboard</h1>
          <p className="text-gray-400">Real-time space debris monitoring and tracking</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* Last Update */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              autoRefresh
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'bg-dark-lighter text-gray-400 border border-gray-600'
            }`}
          >
            <ArrowPathIcon className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh</span>
          </button>
          
          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            className="neon-button px-4 py-2 text-sm"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Objects"
          value={stats.totalObjects.toLocaleString()}
          icon={GlobeAltIcon}
          color="blue"
          trend="+2.3%"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Satellites"
          value={stats.activeSatellites.toLocaleString()}
          icon={CheckCircleIcon}
          color="green"
          trend="+1.8%"
          isLoading={isLoading}
        />
        <StatsCard
          title="Space Debris"
          value={stats.debrisCount.toLocaleString()}
          icon={ExclamationTriangleIcon}
          color="yellow"
          trend="+0.5%"
          isLoading={isLoading}
        />
        <StatsCard
          title="High Risk Collisions"
          value={stats.highRiskCollisions}
          icon={ExclamationTriangleIcon}
          color="red"
          trend="-5.2%"
          isLoading={isLoading}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Object List Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Search and Filters */}
          <div className="glass-card p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search objects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="neon-input pl-10"
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-sm text-neon-blue hover:text-neon-purple transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Object List */}
          <ObjectList
            objects={filteredObjects}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;