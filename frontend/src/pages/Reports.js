import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  ShareIcon,
  PrinterIcon,
  EyeIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState([]);

  // Chart data
  const [debrisData, setDebrisData] = useState([]);
  const [collisionData, setCollisionData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [orbitData, setOrbitData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Mock data generation based on selected report and date range
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockData(selectedReport, dateRange);
      setReportData(data);
      setDebrisData(data.debris || []);
      setCollisionData(data.collisions || []);
      setRiskData(data.risks || []);
      setOrbitData(data.orbits || []);
      setAlertsData(data.alerts || []);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (reportType, range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const baseData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      };
    });

    switch (reportType) {
      case 'overview':
        return {
          debris: baseData.map(d => ({
            ...d,
            tracked: Math.floor(Math.random() * 1000) + 14000,
            newDetections: Math.floor(Math.random() * 50) + 10,
            deorbited: Math.floor(Math.random() * 20) + 5
          })),
          collisions: baseData.map(d => ({
            ...d,
            probability: Math.random() * 0.1,
            events: Math.floor(Math.random() * 5),
            avoidanceManeuvers: Math.floor(Math.random() * 3)
          })),
          risks: [
            { name: 'Low Risk', value: 65, color: '#10B981' },
            { name: 'Medium Risk', value: 25, color: '#F59E0B' },
            { name: 'High Risk', value: 8, color: '#EF4444' },
            { name: 'Critical Risk', value: 2, color: '#DC2626' }
          ],
          orbits: [
            { altitude: 'LEO (160-2000km)', objects: 12500, percentage: 85 },
            { altitude: 'MEO (2000-35786km)', objects: 1800, percentage: 12 },
            { altitude: 'GEO (35786km+)', objects: 450, percentage: 3 }
          ]
        };
      case 'debris':
        return {
          debris: baseData.map(d => ({
            ...d,
            total: Math.floor(Math.random() * 1000) + 14000,
            cataloged: Math.floor(Math.random() * 800) + 12000,
            uncataloged: Math.floor(Math.random() * 200) + 2000,
            fragments: Math.floor(Math.random() * 500) + 8000,
            intact: Math.floor(Math.random() * 300) + 4000,
            rocket_bodies: Math.floor(Math.random() * 200) + 2000
          })),
          sizeDistribution: [
            { size: '< 1cm', count: 128000000, trackable: false },
            { size: '1-10cm', count: 900000, trackable: false },
            { size: '> 10cm', count: 34000, trackable: true }
          ],
          sources: [
            { name: 'Fragmentation', value: 45, color: '#EF4444' },
            { name: 'Mission-related', value: 25, color: '#F59E0B' },
            { name: 'Explosion', value: 20, color: '#DC2626' },
            { name: 'Collision', value: 10, color: '#B91C1C' }
          ]
        };
      case 'collisions':
        return {
          collisions: baseData.map(d => ({
            ...d,
            probability: Math.random() * 0.15,
            conjunctions: Math.floor(Math.random() * 20) + 5,
            closeApproaches: Math.floor(Math.random() * 100) + 50,
            maneuvers: Math.floor(Math.random() * 5)
          })),
          riskLevels: baseData.map(d => ({
            ...d,
            low: Math.floor(Math.random() * 80) + 60,
            medium: Math.floor(Math.random() * 30) + 20,
            high: Math.floor(Math.random() * 15) + 5,
            critical: Math.floor(Math.random() * 5) + 1
          })),
          operators: [
            { name: 'NASA', maneuvers: 15, cost: 2.5 },
            { name: 'ESA', maneuvers: 8, cost: 1.2 },
            { name: 'SpaceX', maneuvers: 12, cost: 1.8 },
            { name: 'Roscosmos', maneuvers: 6, cost: 0.9 },
            { name: 'JAXA', maneuvers: 4, cost: 0.6 }
          ]
        };
      case 'satellites':
        return {
          satellites: baseData.map(d => ({
            ...d,
            active: Math.floor(Math.random() * 100) + 3000,
            inactive: Math.floor(Math.random() * 50) + 500,
            launched: Math.floor(Math.random() * 20) + 5,
            deorbited: Math.floor(Math.random() * 10) + 2
          })),
          constellations: [
            { name: 'Starlink', count: 4500, operator: 'SpaceX' },
            { name: 'OneWeb', count: 648, operator: 'OneWeb' },
            { name: 'Kuiper', count: 0, operator: 'Amazon' },
            { name: 'GPS', count: 32, operator: 'US Space Force' },
            { name: 'Galileo', count: 28, operator: 'ESA' }
          ],
          purposes: [
            { name: 'Communication', value: 40, color: '#3B82F6' },
            { name: 'Earth Observation', value: 25, color: '#10B981' },
            { name: 'Navigation', value: 15, color: '#F59E0B' },
            { name: 'Scientific', value: 12, color: '#8B5CF6' },
            { name: 'Military', value: 8, color: '#EF4444' }
          ]
        };
      default:
        return {};
    }
  };

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'debris', name: 'Space Debris', icon: GlobeAltIcon },
    { id: 'collisions', name: 'Collision Risk', icon: ExclamationTriangleIcon },
    { id: 'satellites', name: 'Satellites', icon: PresentationChartLineIcon },
    { id: 'alerts', name: 'Alerts & Events', icon: ClockIcon }
  ];

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const exportFormats = [
    { id: 'pdf', name: 'PDF Report', description: 'Complete report with charts and data' },
    { id: 'excel', name: 'Excel Spreadsheet', description: 'Raw data in spreadsheet format' },
    { id: 'csv', name: 'CSV Data', description: 'Comma-separated values file' },
    { id: 'json', name: 'JSON Data', description: 'Machine-readable data format' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-lighter border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white">
              <span style={{ color: entry.color }}>{entry.dataKey}: </span>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'neon-blue' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {change > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}/20`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, children, actions }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );

  const exportReport = async (format) => {
    setIsLoading(true);
    try {
      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would trigger a download
      console.log(`Exporting report as ${format}`);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverviewCharts = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tracked Objects"
          value="14,526"
          change={2.3}
          icon={GlobeAltIcon}
        />
        <StatCard
          title="High-Risk Collisions"
          value="75"
          change={-5.2}
          icon={ExclamationTriangleIcon}
          color="red-400"
        />
        <StatCard
          title="Active Satellites"
          value="3,247"
          change={1.8}
          icon={PresentationChartLineIcon}
          color="green-400"
        />
        <StatCard
          title="Recent Alerts"
          value="23"
          change={-12.5}
          icon={ClockIcon}
          color="yellow-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Debris Tracking Trends">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={debrisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="tracked"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="newDetections"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Collision Probability">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={collisionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="probability"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orbital Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orbitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="altitude" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="objects" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );

  const renderDebrisCharts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Debris Trends">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={debrisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="cataloged" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="uncataloged" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Debris Sources">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData?.sources || []}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {(reportData?.sources || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Size Distribution">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(reportData?.sizeDistribution || []).map((item, index) => (
            <div key={index} className="bg-dark-lighter/50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-white">{item.size}</div>
              <div className="text-2xl font-bold text-neon-blue mt-2">
                {item.count.toLocaleString()}
              </div>
              <div className={`text-sm mt-1 ${item.trackable ? 'text-green-400' : 'text-red-400'}`}>
                {item.trackable ? 'Trackable' : 'Not Trackable'}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-3xl font-bold text-white">Reports</h1>
              <p className="text-gray-400">Comprehensive analytics and insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 neon-button px-4 py-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 glass-button px-4 py-2">
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 glass-button px-4 py-2">
              <PrinterIcon className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Report Type:</span>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="glass-button px-3 py-2">
              <FunnelIcon className="w-4 h-4" />
            </button>
            <button className="glass-button px-3 py-2">
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
            </motion.div>
          ) : (
            <motion.div
              key={selectedReport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {selectedReport === 'overview' && renderOverviewCharts()}
              {selectedReport === 'debris' && renderDebrisCharts()}
              {/* Add other report types here */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Export Report</h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-3">
                  {exportFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => exportReport(format.id)}
                      className="w-full text-left p-4 bg-dark-lighter/50 hover:bg-dark-lighter rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <div className="font-medium text-white">{format.name}</div>
                      <div className="text-sm text-gray-400">{format.description}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 glass-button py-2"
                  >
                    Cancel
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

export default Reports;