import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  BellIcon,
  ShieldExclamationIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  BoltIcon,
  FireIcon,
  InformationCircleIcon,
  CogIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    severity: [],
    type: [],
    status: [],
    source: []
  });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [alertSettings, setAlertSettings] = useState({
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    autoAcknowledge: false
  });

  // Load alerts data
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        // Mock data - replace with actual API call
        const mockAlerts = generateMockAlerts();
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, []);

  // Real-time alert updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate new alerts
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 99)]); // Keep only 100 alerts
        
        // Play notification sound if enabled
        if (alertSettings.soundEnabled) {
          playNotificationSound(newAlert.severity);
        }
        
        // Show desktop notification if enabled
        if (alertSettings.desktopNotifications) {
          showDesktopNotification(newAlert);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeEnabled, alertSettings]);

  // Generate mock alerts data
  const generateMockAlerts = () => {
    const severities = ['critical', 'high', 'medium', 'low', 'info'];
    const types = ['collision', 'debris', 'communication', 'system', 'orbital', 'power', 'thermal'];
    const statuses = ['active', 'acknowledged', 'resolved', 'investigating'];
    const sources = ['TLE', 'Radar', 'Optical', 'Satellite', 'Ground Station', 'AI Prediction'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `ALERT-${(Date.now() + i).toString().slice(-8)}`,
      title: generateAlertTitle(),
      description: generateAlertDescription(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      acknowledgedBy: Math.random() > 0.5 ? 'John Doe' : null,
      acknowledgedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
      resolvedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : null,
      affectedObjects: Math.floor(Math.random() * 5) + 1,
      coordinates: {
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360
      },
      probability: Math.random() * 100,
      timeToEvent: Math.random() * 24 * 60, // minutes
      recommendations: generateRecommendations()
    }));
  };

  const generateRandomAlert = () => {
    const severities = ['critical', 'high', 'medium', 'low', 'info'];
    const types = ['collision', 'debris', 'communication', 'system', 'orbital', 'power', 'thermal'];
    const sources = ['TLE', 'Radar', 'Optical', 'Satellite', 'Ground Station', 'AI Prediction'];
    
    return {
      id: `ALERT-${Date.now().toString().slice(-8)}`,
      title: generateAlertTitle(),
      description: generateAlertDescription(),
      severity: severities[Math.floor(Math.random() * severities.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: 'active',
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: new Date(),
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      affectedObjects: Math.floor(Math.random() * 5) + 1,
      coordinates: {
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360
      },
      probability: Math.random() * 100,
      timeToEvent: Math.random() * 24 * 60,
      recommendations: generateRecommendations()
    };
  };

  const generateAlertTitle = () => {
    const titles = [
      'Potential Collision Detected',
      'Space Debris Approaching Satellite',
      'Communication Loss with ISS',
      'Orbital Decay Alert',
      'Power System Anomaly',
      'Thermal Threshold Exceeded',
      'Unexpected Trajectory Change',
      'Solar Storm Warning',
      'Satellite Malfunction Detected',
      'Ground Station Offline'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateAlertDescription = () => {
    const descriptions = [
      'High probability collision event predicted between two tracked objects',
      'Large debris fragment detected on collision course with active satellite',
      'Loss of telemetry signal from International Space Station',
      'Satellite altitude decreasing faster than expected due to atmospheric drag',
      'Battery voltage below critical threshold on communication satellite',
      'Temperature sensors reporting values outside operational limits',
      'Unexpected maneuver detected, possible attitude control system failure',
      'Geomagnetic storm may affect satellite operations and communications',
      'Multiple system failures reported on weather monitoring satellite',
      'Primary ground station experiencing technical difficulties'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const generateRecommendations = () => {
    const recommendations = [
      'Initiate collision avoidance maneuver',
      'Contact satellite operator immediately',
      'Monitor situation closely',
      'Activate backup systems',
      'Notify relevant authorities',
      'Prepare emergency response team',
      'Update orbital predictions',
      'Increase tracking frequency'
    ];
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const playNotificationSound = (severity) => {
    // Implement sound notification based on severity
    console.log(`Playing ${severity} alert sound`);
  };

  const showDesktopNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${alert.severity.toUpperCase()} Alert`, {
        body: alert.title,
        icon: '/favicon.ico'
      });
    }
  };

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.severity.length > 0) {
      filtered = filtered.filter(alert => filters.severity.includes(alert.severity));
    }

    if (filters.type.length > 0) {
      filtered = filtered.filter(alert => filters.type.includes(alert.type));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(alert => filters.status.includes(alert.status));
    }

    if (filters.source.length > 0) {
      filtered = filtered.filter(alert => filters.source.includes(alert.source));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'timestamp' || sortBy === 'acknowledgedAt' || sortBy === 'resolvedAt') {
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
  }, [alerts, searchQuery, filters, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'Current User',
            acknowledgedAt: new Date()
          }
        : alert
    ));
  };

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            resolvedAt: new Date()
          }
        : alert
    ));
  };

  const viewAlertOnMap = (alert) => {
    // Navigate to map view with alert coordinates
    if (alert.coordinates) {
      // Store alert data for map view
      localStorage.setItem('mapViewAlert', JSON.stringify({
        id: alert.id,
        title: alert.title,
        coordinates: alert.coordinates,
        severity: alert.severity
      }));
      
      // Navigate to map view (assuming React Router is used)
      window.location.href = '/map';
    } else {
      alert('No coordinates available for this alert');
    }
  };

  const generateAlertReport = async (alert) => {
    try {
      setIsLoading(true);
      
      const reportData = {
        type: 'collision_analysis',
        parameters: {
          alert_id: alert.id,
          object1: `Object-${alert.affectedObjects}`,
          object2: 'Tracking-Station',
          analysis_date: new Date().toISOString(),
          severity: alert.severity,
          coordinates: alert.coordinates,
          description: alert.description,
          recommendations: alert.recommendations
        }
      };

      const response = await fetch('http://localhost:5000/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alert_report_${alert.id}_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success notification
        alert('Report generated and downloaded successfully!');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = (format) => {
    const dataToExport = filteredAlerts.map(alert => ({
      ID: alert.id,
      Title: alert.title,
      Description: alert.description,
      Severity: alert.severity,
      Type: alert.type,
      Status: alert.status,
      Source: alert.source,
      Timestamp: alert.timestamp.toISOString(),
      'Acknowledged By': alert.acknowledgedBy || 'N/A',
      'Acknowledged At': alert.acknowledgedAt ? alert.acknowledgedAt.toISOString() : 'N/A',
      'Resolved At': alert.resolvedAt ? alert.resolvedAt.toISOString() : 'N/A',
      'Affected Objects': alert.affectedObjects,
      Probability: alert.probability.toFixed(1) + '%',
      'Time to Event': alert.timeToEvent.toFixed(0) + ' minutes'
    }));

    if (format === 'csv') {
      const csv = convertToCSV(dataToExport);
      downloadFile(csv, 'alerts.csv', 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, 'alerts.json', 'application/json');
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

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <FireIcon className="w-5 h-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <ShieldExclamationIcon className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'info':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <BellIcon className="w-4 h-4 text-red-400" />;
      case 'acknowledged':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'investigating':
        return <EyeIcon className="w-4 h-4 text-blue-400" />;
      default:
        return <BellIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-red-400 bg-red-500/20';
      case 'acknowledged':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved':
        return 'text-green-400 bg-green-500/20';
      case 'investigating':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const AlertCard = ({ alert }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card-readable p-4 border-l-4 hover:bg-opacity-95 transition-all duration-300 cursor-pointer ${getSeverityColor(alert.severity)}`}
      onClick={() => setSelectedAlert(alert)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getSeverityIcon(alert.severity)}
          <div>
            <h3 className="font-medium text-white">{alert.title}</h3>
            <p className="text-xs text-gray-300">{alert.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
            {alert.severity.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
            {alert.status.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-100 mb-3 line-clamp-2 leading-relaxed">{alert.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center space-x-4">
          <span>Source: {alert.source}</span>
          <span>Objects: {alert.affectedObjects}</span>
          {alert.probability && (
            <span>Risk: {alert.probability.toFixed(0)}%</span>
          )}
        </div>
        <span>{alert.timestamp.toLocaleString()}</span>
      </div>

      {alert.status === 'active' && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              acknowledgeAlert(alert.id);
            }}
            className="btn-acknowledge text-xs px-3 py-1"
            disabled={alert.status === 'acknowledged'}
          >
            {alert.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-600/30 rounded w-64"></div>
            <div className="h-12 bg-gray-600/20 rounded"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-600/20 rounded"></div>
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
            <BellIcon className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-3xl font-bold text-white">Alerts</h1>
              <p className="text-gray-400">Real-time monitoring and alert management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-400">Active: </span>
              <span className="text-lg font-bold text-red-400">
                {filteredAlerts.filter(a => a.status === 'active').length}
              </span>
            </div>
            <div className="glass-card px-4 py-2">
              <span className="text-sm text-gray-400">Total: </span>
              <span className="text-lg font-bold text-neon-blue">{filteredAlerts.length}</span>
            </div>
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                realTimeEnabled ? 'bg-green-500/20 text-green-400' : 'glass-button'
              }`}
            >
              {realTimeEnabled ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              <span>{realTimeEnabled ? 'Live' : 'Paused'}</span>
            </button>
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
                placeholder="Search alerts..."
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

              <button className="flex items-center space-x-2 glass-button px-4 py-2">
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
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
                  {/* Severity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Severity</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, severity: values }));
                      }}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="info">Info</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, type: values }));
                      }}
                    >
                      <option value="collision">Collision</option>
                      <option value="debris">Debris</option>
                      <option value="communication">Communication</option>
                      <option value="system">System</option>
                      <option value="orbital">Orbital</option>
                      <option value="power">Power</option>
                      <option value="thermal">Thermal</option>
                    </select>
                  </div>

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
                      <option value="acknowledged">Acknowledged</option>
                      <option value="resolved">Resolved</option>
                      <option value="investigating">Investigating</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Source</label>
                    <select
                      multiple
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg text-white p-2"
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setFilters(prev => ({ ...prev, source: values }));
                      }}
                    >
                      <option value="TLE">TLE</option>
                      <option value="Radar">Radar</option>
                      <option value="Optical">Optical</option>
                      <option value="Satellite">Satellite</option>
                      <option value="Ground Station">Ground Station</option>
                      <option value="AI Prediction">AI Prediction</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ severity: [], type: [], status: [], source: [] })}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </AnimatePresence>
        </div>

        {/* Alert Detail Modal */}
        <AnimatePresence>
          {selectedAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAlert(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(selectedAlert.severity)}
                    <h3 className="text-2xl font-bold text-white">{selectedAlert.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-neon-blue mb-2">Description</h4>
                      <p className="text-gray-300">{selectedAlert.description}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-neon-blue mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {selectedAlert.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center space-x-2 text-gray-300">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedAlert.coordinates && (
                      <div>
                        <h4 className="text-lg font-semibold text-neon-blue mb-2">Location</h4>
                        <p className="text-gray-300">
                          Lat: {selectedAlert.coordinates.lat.toFixed(4)}°, 
                          Lng: {selectedAlert.coordinates.lng.toFixed(4)}°
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-neon-blue">Alert Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alert ID:</span>
                        <span className="text-white font-mono">{selectedAlert.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Severity:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                          {selectedAlert.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{selectedAlert.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedAlert.status)}`}>
                          {selectedAlert.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Source:</span>
                        <span className="text-white">{selectedAlert.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-white">{selectedAlert.timestamp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Affected Objects:</span>
                        <span className="text-white">{selectedAlert.affectedObjects}</span>
                      </div>
                      {selectedAlert.probability && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Probability:</span>
                          <span className="text-white">{selectedAlert.probability.toFixed(1)}%</span>
                        </div>
                      )}
                      {selectedAlert.timeToEvent && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time to Event:</span>
                          <span className="text-white">{selectedAlert.timeToEvent.toFixed(0)} min</span>
                        </div>
                      )}
                      {selectedAlert.acknowledgedBy && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Acknowledged By:</span>
                          <span className="text-white">{selectedAlert.acknowledgedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {selectedAlert.status === 'active' && (
                    <button
                      onClick={() => {
                        acknowledgeAlert(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                      className="btn-acknowledge flex-1 min-w-[150px] py-3"
                      disabled={selectedAlert.status === 'acknowledged'}
                    >
                      {selectedAlert.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge Alert'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      viewAlertOnMap(selectedAlert);
                    }}
                    className="btn-view-map flex-1 min-w-[150px] py-3"
                    disabled={!selectedAlert.coordinates}
                  >
                    View on Map
                  </button>
                  <button 
                    onClick={() => {
                      generateAlertReport(selectedAlert);
                    }}
                    className="btn-generate-report flex-1 min-w-[150px] py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
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

export default Alerts;