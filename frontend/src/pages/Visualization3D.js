import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeAltIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ClockIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  SignalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import HyperrealisticGlobe from '../components/HyperrealisticGlobe';

const Visualization3D = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layers, setLayers] = useState({
    satellites: true,
    debris: true,
    rockets: true,
    orbits: false,
    heatmap: false,
    collisionPaths: false
  });
  const [objects, setObjects] = useState([]);
  const [stats, setStats] = useState({
    totalObjects: 0,
    satellites: 0,
    debris: 0,
    rockets: 0,
    highRisk: 0
  });

  // Generate mock space objects data
  const generateSpaceObjects = () => {
    const satellites = [];
    const debris = [];
    const rockets = [];

    // Generate satellites
    for (let i = 0; i < 50; i++) {
      satellites.push({
        id: `sat-${i}`,
        name: `Satellite ${i + 1}`,
        type: 'satellite',
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        altitude: 400 + Math.random() * 1000,
        velocity: 7.5 + Math.random() * 2,
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        mission: ['Communication', 'Earth Observation', 'Navigation', 'Scientific'][Math.floor(Math.random() * 4)],
        launchDate: new Date(Date.now() - Math.random() * 10 * 365 * 24 * 60 * 60 * 1000),
        mass: 100 + Math.random() * 5000,
        country: ['USA', 'Russia', 'China', 'ESA', 'India', 'Japan'][Math.floor(Math.random() * 6)]
      });
    }

    // Generate debris
    for (let i = 0; i < 200; i++) {
      debris.push({
        id: `debris-${i}`,
        name: `Debris ${i + 1}`,
        type: 'debris',
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        altitude: 200 + Math.random() * 2000,
        velocity: 6 + Math.random() * 4,
        size: Math.random() * 10 + 0.1,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        source: ['Collision', 'Explosion', 'Mission Related', 'Unknown'][Math.floor(Math.random() * 4)],
        trackingConfidence: Math.random() * 100
      });
    }

    // Generate rockets
    for (let i = 0; i < 10; i++) {
      rockets.push({
        id: `rocket-${i}`,
        name: `Rocket Stage ${i + 1}`,
        type: 'rocket',
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        altitude: 300 + Math.random() * 800,
        velocity: 7 + Math.random() * 3,
        stage: Math.floor(Math.random() * 3) + 1,
        mission: `Mission ${i + 1}`,
        status: Math.random() > 0.3 ? 'spent' : 'active'
      });
    }

    return { satellites, debris, rockets };
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      const spaceObjects = generateSpaceObjects();
      setObjects([...spaceObjects.satellites, ...spaceObjects.debris, ...spaceObjects.rockets]);
      
      setStats({
        totalObjects: spaceObjects.satellites.length + spaceObjects.debris.length + spaceObjects.rockets.length,
        satellites: spaceObjects.satellites.length,
        debris: spaceObjects.debris.length,
        rockets: spaceObjects.rockets.length,
        highRisk: spaceObjects.debris.filter(d => d.riskLevel === 'high').length
      });
    };

    loadData();
  }, []);

  // Time simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => new Date(prev.getTime() + timeSpeed * 60000)); // Add minutes based on speed
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeSpeed]);

  const handleObjectSelect = (object) => {
    setSelectedObject(object);
  };

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getFilteredObjects = () => {
    return objects.filter(obj => {
      if (obj.type === 'satellite' && !layers.satellites) return false;
      if (obj.type === 'debris' && !layers.debris) return false;
      if (obj.type === 'rocket' && !layers.rockets) return false;
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-space-dark">
      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <GlobeAltIcon className="w-10 h-10 mr-3 text-neon-blue" />
              3D Space Visualization
            </h1>
            <p className="text-gray-400">
              Hyperrealistic real-time tracking of satellites, debris, and space objects
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-card p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-blue">{stats.totalObjects}</div>
                <div className="text-xs text-gray-400">Total Objects</div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.satellites}</div>
                <div className="text-xs text-gray-400">Satellites</div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.highRisk}</div>
                <div className="text-xs text-gray-400">High Risk</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ClockIcon className="w-5 h-5 text-neon-blue" />
              <span className="text-white font-medium">
                {currentTime.toLocaleString()}
              </span>
              <span className="text-gray-400">
                Speed: {timeSpeed}x
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimeSpeed(Math.max(0.1, timeSpeed - 0.5))}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <BackwardIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setTimeSpeed(Math.min(10, timeSpeed + 0.5))}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <ForwardIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Layer Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Visualization Layers
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.satellites}
                onChange={() => toggleLayer('satellites')}
                className="rounded text-green-500"
              />
              <SignalIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Satellites</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.debris}
                onChange={() => toggleLayer('debris')}
                className="rounded text-red-500"
              />
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">Debris</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.rockets}
                onChange={() => toggleLayer('rockets')}
                className="rounded text-blue-500"
              />
              <RocketLaunchIcon className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Rockets</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.orbits}
                onChange={() => toggleLayer('orbits')}
                className="rounded text-purple-500"
              />
              <CubeIcon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Orbits</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.heatmap}
                onChange={() => toggleLayer('heatmap')}
                className="rounded text-orange-500"
              />
              <ChartBarIcon className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Heatmap</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layers.collisionPaths}
                onChange={() => toggleLayer('collisionPaths')}
                className="rounded text-yellow-500"
              />
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Collision Paths</span>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Hyperrealistic 3D Globe Container */}
      <div className="mx-6 mb-6 h-[calc(100vh-400px)] rounded-xl overflow-hidden">
        <HyperrealisticGlobe
          satellites={getFilteredObjects().filter(obj => obj.type === 'satellite')}
          debris={getFilteredObjects().filter(obj => obj.type === 'debris')}
          onObjectSelect={handleObjectSelect}
          showControls={true}
          className="w-full h-full"
          settings={{
            animationSpeed: timeSpeed,
            showOrbits: layers.orbits,
            showHeatmap: layers.heatmap,
            showCollisionPaths: layers.collisionPaths
          }}
        />
      </div>

      {/* Object Details Panel */}
      <AnimatePresence>
        {selectedObject && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 w-96 h-full bg-dark/95 backdrop-blur-lg border-l border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Object Details</h2>
                <button
                  onClick={() => setSelectedObject(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-white mb-2">{selectedObject.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{selectedObject.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Altitude:</span>
                      <span className="text-white">{selectedObject.altitude?.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Velocity:</span>
                      <span className="text-white">{selectedObject.velocity?.toFixed(2)} km/s</span>
                    </div>
                    {selectedObject.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`capitalize ${
                          selectedObject.status === 'active' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedObject.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedObject.type === 'satellite' && (
                  <div className="glass-card p-4">
                    <h4 className="font-semibold text-white mb-2">Mission Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mission:</span>
                        <span className="text-white">{selectedObject.mission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Country:</span>
                        <span className="text-white">{selectedObject.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mass:</span>
                        <span className="text-white">{selectedObject.mass?.toFixed(0)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Launch Date:</span>
                        <span className="text-white">
                          {selectedObject.launchDate?.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedObject.type === 'debris' && (
                  <div className="glass-card p-4">
                    <h4 className="font-semibold text-white mb-2">Debris Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white">{selectedObject.size?.toFixed(2)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Level:</span>
                        <span className={`capitalize ${
                          selectedObject.riskLevel === 'high' ? 'text-red-400' :
                          selectedObject.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {selectedObject.riskLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Source:</span>
                        <span className="text-white">{selectedObject.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tracking:</span>
                        <span className="text-white">{selectedObject.trackingConfidence?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Visualization3D;