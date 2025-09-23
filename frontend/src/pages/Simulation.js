import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  CogIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const Simulation = () => {
  const [simulations, setSimulations] = useState([]);
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('collision-avoidance');
  const [simulationResults, setSimulationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef(null);

  // Simulation parameters
  const [simParams, setSimParams] = useState({
    duration: 24, // hours
    timeStep: 60, // seconds
    includeAtmosphericDrag: true,
    includeSolarRadiation: true,
    includeGravitationalPerturbations: true,
    includeThirdBodyEffects: false,
    propagationModel: 'sgp4',
    coordinateSystem: 'eci'
  });

  // New simulation form
  const [newSimulation, setNewSimulation] = useState({
    name: '',
    description: '',
    scenario: 'collision-avoidance',
    objects: [],
    startTime: new Date().toISOString().slice(0, 16),
    duration: 24,
    parameters: { ...simParams }
  });

  useEffect(() => {
    loadSimulations();
  }, []);

  useEffect(() => {
    if (isPlaying && activeSimulation) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + timeScale;
          if (newTime >= activeSimulation.duration * 3600) {
            setIsPlaying(false);
            return activeSimulation.duration * 3600;
          }
          return newTime;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, activeSimulation, timeScale]);

  const loadSimulations = () => {
    // Mock data - replace with actual API call
    const mockSimulations = [
      {
        id: 'sim-001',
        name: 'ISS Collision Avoidance',
        description: 'Simulation of potential debris collision with ISS and avoidance maneuvers',
        scenario: 'collision-avoidance',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        duration: 48,
        objects: ['ISS', 'DEBRIS-001', 'DEBRIS-002'],
        results: {
          collisionProbability: 0.15,
          maneuverRequired: true,
          fuelConsumption: 2.5,
          successRate: 98.5
        }
      },
      {
        id: 'sim-002',
        name: 'Starlink Constellation Deployment',
        description: 'Orbital mechanics simulation for Starlink satellite deployment',
        scenario: 'constellation-deployment',
        status: 'running',
        createdAt: new Date('2024-01-20'),
        duration: 72,
        objects: Array.from({ length: 60 }, (_, i) => `STARLINK-${i + 1}`),
        results: null
      },
      {
        id: 'sim-003',
        name: 'Lunar Mission Trajectory',
        description: 'Earth-Moon transfer trajectory optimization',
        scenario: 'mission-planning',
        status: 'pending',
        createdAt: new Date('2024-01-22'),
        duration: 168,
        objects: ['ARTEMIS-1', 'MOON', 'EARTH'],
        results: null
      }
    ];
    setSimulations(mockSimulations);
  };

  const createSimulation = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulation = {
        id: `sim-${Date.now()}`,
        ...newSimulation,
        status: 'pending',
        createdAt: new Date(),
        results: null
      };
      
      setSimulations(prev => [simulation, ...prev]);
      setShowCreateModal(false);
      setNewSimulation({
        name: '',
        description: '',
        scenario: 'collision-avoidance',
        objects: [],
        startTime: new Date().toISOString().slice(0, 16),
        duration: 24,
        parameters: { ...simParams }
      });
    } catch (error) {
      console.error('Failed to create simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async (simulation) => {
    setIsLoading(true);
    try {
      // Mock simulation run
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const results = generateMockResults(simulation);
      
      setSimulations(prev => prev.map(sim => 
        sim.id === simulation.id 
          ? { ...sim, status: 'completed', results }
          : sim
      ));
      
      setSimulationResults(results);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResults = (simulation) => {
    switch (simulation.scenario) {
      case 'collision-avoidance':
        return {
          collisionProbability: Math.random() * 0.3,
          maneuverRequired: Math.random() > 0.5,
          fuelConsumption: Math.random() * 5,
          successRate: 95 + Math.random() * 5,
          trajectoryData: generateTrajectoryData(),
          riskAssessment: generateRiskAssessment()
        };
      case 'constellation-deployment':
        return {
          deploymentSuccess: Math.random() > 0.1,
          orbitalAccuracy: 95 + Math.random() * 5,
          timeToDeployment: Math.random() * 24,
          coverageEfficiency: 85 + Math.random() * 15,
          trajectoryData: generateTrajectoryData(),
          constellationMetrics: generateConstellationMetrics()
        };
      case 'mission-planning':
        return {
          trajectoryOptimal: Math.random() > 0.2,
          fuelEfficiency: 80 + Math.random() * 20,
          missionDuration: simulation.duration + (Math.random() - 0.5) * 24,
          successProbability: 90 + Math.random() * 10,
          trajectoryData: generateTrajectoryData(),
          missionMetrics: generateMissionMetrics()
        };
      default:
        return {
          status: 'completed',
          trajectoryData: generateTrajectoryData()
        };
    }
  };

  const generateTrajectoryData = () => {
    return Array.from({ length: 100 }, (_, i) => ({
      time: i,
      position: {
        x: Math.sin(i * 0.1) * 7000 + Math.random() * 100,
        y: Math.cos(i * 0.1) * 7000 + Math.random() * 100,
        z: Math.sin(i * 0.05) * 1000 + Math.random() * 50
      },
      velocity: {
        x: Math.cos(i * 0.1) * 7.5 + Math.random() * 0.1,
        y: -Math.sin(i * 0.1) * 7.5 + Math.random() * 0.1,
        z: Math.cos(i * 0.05) * 0.5 + Math.random() * 0.05
      }
    }));
  };

  const generateRiskAssessment = () => ({
    overall: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    factors: [
      { name: 'Collision Probability', value: Math.random() * 100, risk: 'medium' },
      { name: 'Atmospheric Drag', value: Math.random() * 100, risk: 'low' },
      { name: 'Solar Activity', value: Math.random() * 100, risk: 'low' },
      { name: 'Orbital Debris', value: Math.random() * 100, risk: 'high' }
    ]
  });

  const generateConstellationMetrics = () => ({
    totalSatellites: 60,
    deployedSatellites: Math.floor(Math.random() * 60),
    operationalSatellites: Math.floor(Math.random() * 55),
    coverage: Math.random() * 100,
    latency: Math.random() * 50 + 10
  });

  const generateMissionMetrics = () => ({
    deltaV: Math.random() * 3000 + 1000,
    burnDuration: Math.random() * 300 + 60,
    accuracy: Math.random() * 10 + 90,
    efficiency: Math.random() * 20 + 80
  });

  const playSimulation = (simulation) => {
    setActiveSimulation(simulation);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const resetSimulation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'running':
        return 'text-blue-400 bg-blue-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getScenarioIcon = (scenario) => {
    switch (scenario) {
      case 'collision-avoidance':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'constellation-deployment':
        return <RocketLaunchIcon className="w-5 h-5" />;
      case 'mission-planning':
        return <ChartBarIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  const SimulationCard = ({ simulation }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 hover:bg-dark-lighter/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getScenarioIcon(simulation.scenario)}
          <div>
            <h3 className="text-lg font-semibold text-white">{simulation.name}</h3>
            <p className="text-sm text-gray-400">{simulation.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(simulation.status)}`}>
          {simulation.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Duration:</span>
          <span className="text-white ml-2">{simulation.duration}h</span>
        </div>
        <div>
          <span className="text-gray-400">Objects:</span>
          <span className="text-white ml-2">{simulation.objects.length}</span>
        </div>
        <div>
          <span className="text-gray-400">Created:</span>
          <span className="text-white ml-2">{simulation.createdAt.toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Scenario:</span>
          <span className="text-white ml-2 capitalize">{simulation.scenario.replace('-', ' ')}</span>
        </div>
      </div>

      {simulation.results && (
        <div className="mb-4 p-3 bg-dark-lighter/50 rounded-lg">
          <h4 className="text-sm font-medium text-neon-blue mb-2">Results Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(simulation.results).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                <span className="text-white">
                  {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                  {key.includes('Probability') || key.includes('Rate') || key.includes('Efficiency') ? '%' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {simulation.status === 'pending' && (
          <button
            onClick={() => runSimulation(simulation)}
            className="flex-1 neon-button py-2 text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Simulation'}
          </button>
        )}
        {simulation.status === 'completed' && (
          <button
            onClick={() => playSimulation(simulation)}
            className="flex-1 neon-button py-2 text-sm"
          >
            View Results
          </button>
        )}
        <button className="glass-button px-3 py-2">
          <EyeIcon className="w-4 h-4" />
        </button>
        <button className="glass-button px-3 py-2">
          <PencilIcon className="w-4 h-4" />
        </button>
        <button className="glass-button px-3 py-2 text-red-400">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RocketLaunchIcon className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-3xl font-bold text-white">Simulation</h1>
              <p className="text-gray-400">Mission planning and trajectory simulation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 neon-button px-4 py-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Simulation</span>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center space-x-2 glass-button px-4 py-2"
            >
              <CogIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Active Simulation Controls */}
        {activeSimulation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{activeSimulation.name}</h3>
                <p className="text-gray-400">Active Simulation</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-neon-blue">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-400">
                  / {formatTime(activeSimulation.duration * 3600)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-dark-lighter rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentTime / (activeSimulation.duration * 3600)) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => isPlaying ? pauseSimulation() : setIsPlaying(true)}
                  className="glass-button p-2"
                >
                  {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopSimulation}
                  className="glass-button p-2"
                >
                  <StopIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={resetSimulation}
                  className="glass-button p-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button className="glass-button p-2">
                  <BackwardIcon className="w-5 h-5" />
                </button>
                <button className="glass-button p-2">
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Speed:</span>
                  <select
                    value={timeScale}
                    onChange={(e) => setTimeScale(Number(e.target.value))}
                    className="bg-dark-lighter border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value={0.1}>0.1x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                  </select>
                </div>
                <button className="glass-button px-3 py-1 text-sm">
                  Export Data
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simulation Results */}
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Simulation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(simulationResults).map(([key, value]) => {
                if (typeof value === 'object') return null;
                return (
                  <div key={key} className="bg-dark-lighter/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {typeof value === 'number' ? value.toFixed(2) : value.toString()}
                      {key.includes('Probability') || key.includes('Rate') || key.includes('Efficiency') ? '%' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Simulations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {simulations.map((simulation) => (
              <SimulationCard key={simulation.id} simulation={simulation} />
            ))}
          </AnimatePresence>
        </div>

        {/* Create Simulation Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Create New Simulation</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Simulation Name
                    </label>
                    <input
                      type="text"
                      value={newSimulation.name}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter simulation name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newSimulation.description}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
                      placeholder="Enter simulation description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Scenario Type
                      </label>
                      <select
                        value={newSimulation.scenario}
                        onChange={(e) => setNewSimulation(prev => ({ ...prev, scenario: e.target.value }))}
                        className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="collision-avoidance">Collision Avoidance</option>
                        <option value="constellation-deployment">Constellation Deployment</option>
                        <option value="mission-planning">Mission Planning</option>
                        <option value="debris-tracking">Debris Tracking</option>
                        <option value="orbital-mechanics">Orbital Mechanics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={newSimulation.duration}
                        onChange={(e) => setNewSimulation(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                        min="1"
                        max="168"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={newSimulation.startTime}
                      onChange={(e) => setNewSimulation(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={createSimulation}
                    disabled={isLoading || !newSimulation.name}
                    className="flex-1 neon-button py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Simulation'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 glass-button py-2"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSettingsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Simulation Settings</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-neon-blue mb-4">Propagation Parameters</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Time Step (seconds)
                        </label>
                        <input
                          type="number"
                          value={simParams.timeStep}
                          onChange={(e) => setSimParams(prev => ({ ...prev, timeStep: Number(e.target.value) }))}
                          className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Propagation Model
                        </label>
                        <select
                          value={simParams.propagationModel}
                          onChange={(e) => setSimParams(prev => ({ ...prev, propagationModel: e.target.value }))}
                          className="w-full bg-dark-lighter border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="sgp4">SGP4</option>
                          <option value="numerical">Numerical Integration</option>
                          <option value="analytical">Analytical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-neon-blue mb-4">Force Models</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'includeAtmosphericDrag', label: 'Atmospheric Drag' },
                        { key: 'includeSolarRadiation', label: 'Solar Radiation Pressure' },
                        { key: 'includeGravitationalPerturbations', label: 'Gravitational Perturbations' },
                        { key: 'includeThirdBodyEffects', label: 'Third Body Effects' }
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={simParams[key]}
                            onChange={(e) => setSimParams(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="w-4 h-4 text-neon-blue bg-dark-lighter border-gray-600 rounded focus:ring-neon-blue"
                          />
                          <span className="text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 neon-button py-2"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(false)}
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

export default Simulation;