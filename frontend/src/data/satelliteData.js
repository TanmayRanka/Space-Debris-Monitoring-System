// Sample satellite data with realistic orbital parameters
export const sampleSatellites = [
  {
    id: 1,
    name: "ISS (International Space Station)",
    altitude: 408, // km
    inclination: 51.6, // degrees
    longitudeOfAscendingNode: 125.2,
    argumentOfPerigee: 73.0,
    meanAnomaly: 45.0,
    type: "space_station",
    country: "International",
    launchDate: "1998-11-20",
    mass: 420000, // kg
    purpose: "Research"
  },
  {
    id: 2,
    name: "Hubble Space Telescope",
    altitude: 547,
    inclination: 28.5,
    longitudeOfAscendingNode: 85.7,
    argumentOfPerigee: 12.3,
    meanAnomaly: 180.0,
    type: "observatory",
    country: "USA",
    launchDate: "1990-04-24",
    mass: 11110,
    purpose: "Astronomy"
  },
  {
    id: 3,
    name: "GPS IIF-12",
    altitude: 20200,
    inclination: 55.0,
    longitudeOfAscendingNode: 45.8,
    argumentOfPerigee: 90.0,
    meanAnomaly: 270.0,
    type: "navigation",
    country: "USA",
    launchDate: "2016-02-05",
    mass: 1630,
    purpose: "Navigation"
  },
  {
    id: 4,
    name: "Starlink-1007",
    altitude: 550,
    inclination: 53.0,
    longitudeOfAscendingNode: 200.5,
    argumentOfPerigee: 0.0,
    meanAnomaly: 90.0,
    type: "communication",
    country: "USA",
    launchDate: "2020-01-29",
    mass: 260,
    purpose: "Internet"
  },
  {
    id: 5,
    name: "GOES-16",
    altitude: 35786, // Geostationary
    inclination: 0.1,
    longitudeOfAscendingNode: 75.2,
    argumentOfPerigee: 0.0,
    meanAnomaly: 0.0,
    type: "weather",
    country: "USA",
    launchDate: "2016-11-19",
    mass: 5192,
    purpose: "Weather Monitoring"
  },
  {
    id: 6,
    name: "Sentinel-1A",
    altitude: 693,
    inclination: 98.18,
    longitudeOfAscendingNode: 15.0,
    argumentOfPerigee: 0.0,
    meanAnomaly: 315.0,
    type: "earth_observation",
    country: "ESA",
    launchDate: "2014-04-03",
    mass: 2300,
    purpose: "Earth Observation"
  },
  {
    id: 7,
    name: "COSMOS 2251 (Debris)",
    altitude: 790,
    inclination: 74.0,
    longitudeOfAscendingNode: 330.0,
    argumentOfPerigee: 45.0,
    meanAnomaly: 135.0,
    type: "debris",
    country: "Russia",
    launchDate: "1993-06-16",
    mass: 950,
    purpose: "Communication (Defunct)"
  },
  {
    id: 8,
    name: "Tiangong Space Station",
    altitude: 340,
    inclination: 41.5,
    longitudeOfAscendingNode: 290.0,
    argumentOfPerigee: 0.0,
    meanAnomaly: 225.0,
    type: "space_station",
    country: "China",
    launchDate: "2021-04-29",
    mass: 66000,
    purpose: "Research"
  },
  {
    id: 9,
    name: "NOAA-20",
    altitude: 824,
    inclination: 98.7,
    longitudeOfAscendingNode: 160.0,
    argumentOfPerigee: 0.0,
    meanAnomaly: 60.0,
    type: "weather",
    country: "USA",
    launchDate: "2017-11-18",
    mass: 2540,
    purpose: "Weather Monitoring"
  },
  {
    id: 10,
    name: "OneWeb-0001",
    altitude: 1200,
    inclination: 87.4,
    longitudeOfAscendingNode: 120.0,
    argumentOfPerigee: 0.0,
    meanAnomaly: 300.0,
    type: "communication",
    country: "UK",
    launchDate: "2019-02-27",
    mass: 147,
    purpose: "Internet"
  }
];

// Sample space debris data
export const sampleDebris = [
  {
    id: 1,
    name: "Fengyun-1C Debris Fragment",
    altitude: 850,
    inclination: 98.9,
    longitude: 45.0,
    size: "medium",
    risk: "high",
    origin: "Anti-satellite test",
    trackingId: "32252"
  },
  {
    id: 2,
    name: "Cosmos 2251 Fragment",
    altitude: 790,
    inclination: 74.0,
    longitude: 120.0,
    size: "large",
    risk: "high",
    origin: "Collision with Iridium 33",
    trackingId: "34454"
  },
  {
    id: 3,
    name: "Upper Stage Rocket Body",
    altitude: 650,
    inclination: 82.5,
    longitude: 200.0,
    size: "large",
    risk: "medium",
    origin: "Launch vehicle",
    trackingId: "25544"
  },
  {
    id: 4,
    name: "Paint Fleck",
    altitude: 400,
    inclination: 51.6,
    longitude: 300.0,
    size: "small",
    risk: "low",
    origin: "Spacecraft degradation",
    trackingId: "41335"
  },
  {
    id: 5,
    name: "Micrometeorite Shield Fragment",
    altitude: 550,
    inclination: 53.0,
    longitude: 75.0,
    size: "small",
    risk: "medium",
    origin: "Impact damage",
    trackingId: "44713"
  }
];

// Orbital mechanics utilities
export const orbitalMechanics = {
  // Earth's gravitational parameter (km³/s²)
  MU: 398600.4418,
  
  // Earth's radius (km)
  EARTH_RADIUS: 6371,
  
  // Calculate orbital period using Kepler's third law
  calculateOrbitalPeriod: (altitude) => {
    const semiMajorAxis = orbitalMechanics.EARTH_RADIUS + altitude;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / orbitalMechanics.MU);
  },
  
  // Calculate mean motion (radians per second)
  calculateMeanMotion: (altitude) => {
    const period = orbitalMechanics.calculateOrbitalPeriod(altitude);
    return (2 * Math.PI) / period;
  },
  
  // Convert orbital elements to Cartesian coordinates
  orbitalToCartesian: (altitude, inclination, raan, argOfPerigee, meanAnomaly) => {
    const radius = orbitalMechanics.EARTH_RADIUS + altitude;
    
    // Convert to radians
    const incRad = inclination * Math.PI / 180;
    const raanRad = raan * Math.PI / 180;
    const argPerigeeRad = argOfPerigee * Math.PI / 180;
    const meanAnomalyRad = meanAnomaly * Math.PI / 180;
    
    // For circular orbits, true anomaly ≈ mean anomaly
    const trueAnomaly = meanAnomalyRad;
    
    // Position in orbital plane
    const x_orbital = radius * Math.cos(trueAnomaly);
    const y_orbital = radius * Math.sin(trueAnomaly);
    const z_orbital = 0;
    
    // Apply rotations
    // 1. Rotate by argument of perigee
    const x1 = x_orbital * Math.cos(argPerigeeRad) - y_orbital * Math.sin(argPerigeeRad);
    const y1 = x_orbital * Math.sin(argPerigeeRad) + y_orbital * Math.cos(argPerigeeRad);
    const z1 = z_orbital;
    
    // 2. Rotate by inclination
    const x2 = x1;
    const y2 = y1 * Math.cos(incRad) - z1 * Math.sin(incRad);
    const z2 = y1 * Math.sin(incRad) + z1 * Math.cos(incRad);
    
    // 3. Rotate by RAAN
    const x3 = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
    const y3 = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);
    const z3 = z2;
    
    return { x: x3, y: y3, z: z3 };
  },
  
  // Update mean anomaly based on time
  updateMeanAnomaly: (currentMeanAnomaly, altitude, deltaTime) => {
    const meanMotion = orbitalMechanics.calculateMeanMotion(altitude);
    return (currentMeanAnomaly + meanMotion * deltaTime) % (2 * Math.PI);
  }
};