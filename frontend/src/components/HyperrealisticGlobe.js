import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  PlayIcon,
  PauseIcon,
  SunIcon,
  EyeIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

const HyperrealisticGlobe = ({ 
  satellites = [], 
  debris = [], 
  onObjectSelect, 
  className = '', 
  showControls = true,
  settings = {}
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const earthRef = useRef(null);
  const cloudsRef = useRef(null);
  const atmosphereRef = useRef(null);
  const satellitesGroupRef = useRef(null);
  const debrisGroupRef = useRef(null);
  const starsRef = useRef(null);
  const animationIdRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [trackedSatellite, setTrackedSatellite] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Enhanced realistic lighting setup
    
    // Ambient light for space environment (very low)
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.1);
    scene.add(ambientLight);

    // Main sun light (directional light representing the sun)
    const sunLight = new THREE.DirectionalLight(0xffd700, 3.0); // Bright golden yellow
    sunLight.position.set(10, 5, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    
    // Secondary fill light (simulating reflected light from space)
    const fillLight = new THREE.DirectionalLight(0x4169e1, 0.3);
    fillLight.position.set(-8, -2, -5);
    scene.add(fillLight);
    
    // Rim light for atmospheric edge lighting
    const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);
    
    // Point light for city lights effect (night side)
    const cityLight = new THREE.PointLight(0xffaa00, 0.5, 5);
    cityLight.position.set(-3, 0, 0);
    scene.add(cityLight);
    
    // Store lights for animation
    const lights = {
      sun: sunLight,
      fill: fillLight,
      rim: rimLight,
      city: cityLight
    };
    
    // Animate sun position for day/night cycle
    let sunAngle = 0;
    const animateLighting = () => {
      sunAngle += 0.005;
      
      // Rotate sun around Earth
      lights.sun.position.x = Math.cos(sunAngle) * 10;
      lights.sun.position.z = Math.sin(sunAngle) * 10;
      lights.sun.position.y = Math.sin(sunAngle * 0.5) * 3;
      
      // Adjust sun intensity based on position
      const intensity = Math.max(0.5, Math.abs(Math.cos(sunAngle))) * 2.5;
      lights.sun.intensity = intensity;
      
      // Adjust fill light opposite to sun
      lights.fill.position.x = -lights.sun.position.x * 0.3;
      lights.fill.position.z = -lights.sun.position.z * 0.3;
      
      // City lights stronger on night side
      const nightIntensity = Math.max(0, -Math.cos(sunAngle)) * 0.8;
      lights.city.intensity = nightIntensity;
      
      requestAnimationFrame(animateLighting);
    };
    
    // Start lighting animation
    animateLighting();

    // Create starfield
    createStarfield(scene);
    
    // Create Earth
    createEarth(scene);
    
    // Create atmosphere
    createAtmosphere(scene);
    
    // Create clouds
    createClouds(scene);
    
    // Initialize satellite and debris groups
    satellitesGroupRef.current = new THREE.Group();
    debrisGroupRef.current = new THREE.Group();
    scene.add(satellitesGroupRef.current);
    scene.add(debrisGroupRef.current);

    setGlobeReady(true);
    setIsLoading(false);

    // Start animation loop
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create hyperrealistic starfield background with astronomical accuracy
  const createStarfield = useCallback((scene) => {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 350000; // Increased star density for ultra-realistic sky
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // Enhanced realistic star color temperatures with more stellar classes
    const starTypes = [
      { temp: 2500, color: [1.0, 0.3, 0.0], weight: 0.05, class: 'M' }, // Red dwarfs (most common)
      { temp: 3000, color: [1.0, 0.4, 0.0], weight: 0.15, class: 'K' }, // Orange dwarfs
      { temp: 4000, color: [1.0, 0.7, 0.4], weight: 0.12, class: 'K' }, // Orange giants
      { temp: 5800, color: [1.0, 1.0, 0.9], weight: 0.25, class: 'G' }, // Sun-like (G-type)
      { temp: 6500, color: [0.95, 0.98, 1.0], weight: 0.18, class: 'F' }, // Yellow-white
      { temp: 7500, color: [0.9, 0.95, 1.0], weight: 0.15, class: 'A' }, // White stars
      { temp: 10000, color: [0.8, 0.85, 1.0], weight: 0.08, class: 'B' }, // Blue-white
      { temp: 20000, color: [0.6, 0.7, 1.0], weight: 0.015, class: 'O' }, // Blue giants
      { temp: 30000, color: [0.4, 0.6, 1.0], weight: 0.005, class: 'O' } // Blue supergiants
    ];

    // Famous bright stars with accurate positions and properties
    const brightStars = [
      { name: 'Sirius', pos: [150, -16, 120], mag: -1.46, color: [0.9, 0.95, 1.0], class: 'A' },
      { name: 'Canopus', pos: [-120, -52, 180], mag: -0.74, color: [1.0, 0.9, 0.7], class: 'F' },
      { name: 'Arcturus', pos: [-80, 19, 140], mag: -0.05, color: [1.0, 0.6, 0.3], class: 'K' },
      { name: 'Vega', pos: [90, 38, 160], mag: 0.03, color: [0.9, 0.95, 1.0], class: 'A' },
      { name: 'Capella', pos: [95, 45, 170], mag: 0.08, color: [1.0, 0.9, 0.7], class: 'G' },
      { name: 'Rigel', pos: [120, -8, 130], mag: 0.13, color: [0.7, 0.8, 1.0], class: 'B' },
      { name: 'Procyon', pos: [110, 5, 125], mag: 0.34, color: [1.0, 0.95, 0.8], class: 'F' },
      { name: 'Betelgeuse', pos: [125, 7, 135], mag: 0.50, color: [1.0, 0.4, 0.2], class: 'M' },
      { name: 'Achernar', pos: [-140, -57, 200], mag: 0.46, color: [0.8, 0.9, 1.0], class: 'B' },
      { name: 'Hadar', pos: [-100, -60, 180], mag: 0.61, color: [0.7, 0.8, 1.0], class: 'B' },
      { name: 'Altair', pos: [85, 8, 145], mag: 0.77, color: [0.95, 0.98, 1.0], class: 'A' },
      { name: 'Acrux', pos: [-110, -63, 185], mag: 0.77, color: [0.8, 0.85, 1.0], class: 'B' },
      { name: 'Aldebaran', pos: [70, 16, 110], mag: 0.85, color: [1.0, 0.6, 0.3], class: 'K' },
      { name: 'Antares', pos: [-95, -26, 160], mag: 1.09, color: [1.0, 0.3, 0.1], class: 'M' },
      { name: 'Spica', pos: [-75, -11, 150], mag: 1.04, color: [0.7, 0.8, 1.0], class: 'B' },
      { name: 'Pollux', pos: [105, 28, 140], mag: 1.14, color: [1.0, 0.7, 0.4], class: 'K' },
      { name: 'Fomalhaut', pos: [-50, -29, 120], mag: 1.16, color: [0.9, 0.95, 1.0], class: 'A' },
      { name: 'Deneb', pos: [95, 45, 220], mag: 1.25, color: [0.9, 0.95, 1.0], class: 'A' },
      { name: 'Regulus', pos: [75, 11, 130], mag: 1.35, color: [0.8, 0.9, 1.0], class: 'B' }
    ];

    // Add bright stars first
    let starIndex = 0;
    brightStars.forEach(star => {
      const i3 = starIndex * 3;
      positions[i3] = star.pos[0];
      positions[i3 + 1] = star.pos[1];
      positions[i3 + 2] = star.pos[2];
      
      colors[i3] = star.color[0];
      colors[i3 + 1] = star.color[1];
      colors[i3 + 2] = star.color[2];
      
      // Convert magnitude to size (brighter = larger)
      const starSize = Math.max(2, 20 - star.mag * 3);
      sizes[starIndex] = starSize;
      starIndex++;
    });

    // Generate remaining stars with Milky Way galactic structure
    for (let i = starIndex; i < starCount; i++) {
      const i3 = i * 3;
      
      // Milky Way galactic coordinate system simulation
      const galacticLongitude = Math.random() * Math.PI * 2;
      const galacticLatitude = (Math.random() - 0.5) * Math.PI;
      
      // Higher star density near galactic plane (Milky Way band)
      const galacticPlaneBoost = Math.exp(-Math.abs(galacticLatitude) * 3);
      const densityFactor = 0.3 + galacticPlaneBoost * 0.7;
      
      // Skip some stars outside galactic plane for realistic distribution
      if (Math.random() > densityFactor) {
        i--;
        continue;
      }
      
      // Distance distribution with realistic stellar density falloff
      let radius;
      const distanceRand = Math.random();
      
      if (distanceRand < 0.15) {
        radius = 80 + Math.random() * 50; // Local stellar neighborhood
      } else if (distanceRand < 0.35) {
        radius = 130 + Math.random() * 100; // Local arm stars
      } else if (distanceRand < 0.55) {
        radius = 230 + Math.random() * 150; // Spiral arm stars
      } else if (distanceRand < 0.75) {
        radius = 380 + Math.random() * 200; // Distant spiral arms
      } else if (distanceRand < 0.9) {
        radius = 580 + Math.random() * 300; // Galactic halo
      } else {
        radius = 880 + Math.random() * 500; // Distant background
      }
      
      // Convert galactic coordinates to Cartesian
      const x = radius * Math.cos(galacticLatitude) * Math.cos(galacticLongitude);
      const y = radius * Math.sin(galacticLatitude);
      const z = radius * Math.cos(galacticLatitude) * Math.sin(galacticLongitude);
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Realistic stellar population based on galactic location
      let selectedType = starTypes[0];
      const rand = Math.random();
      let cumWeight = 0;
      
      // Modify stellar population based on galactic position
      let adjustedStarTypes = [...starTypes];
      
      // More massive stars in spiral arms, more red dwarfs in halo
      if (Math.abs(galacticLatitude) > 0.3) { // Galactic halo
        adjustedStarTypes[0].weight = 0.4; // More red dwarfs
        adjustedStarTypes[6].weight = 0.02; // Fewer blue stars
        adjustedStarTypes[7].weight = 0.005;
        adjustedStarTypes[8].weight = 0.001;
      } else if (galacticPlaneBoost > 0.8) { // Spiral arms
        adjustedStarTypes[0].weight = 0.25; // Fewer red dwarfs
        adjustedStarTypes[6].weight = 0.12; // More blue stars
        adjustedStarTypes[7].weight = 0.025;
        adjustedStarTypes[8].weight = 0.01;
      }
      
      for (const type of adjustedStarTypes) {
        cumWeight += type.weight;
        if (rand <= cumWeight) {
          selectedType = type;
          break;
        }
      }
      
      // Enhanced color variation with stellar evolution effects
      const colorVariation = 0.08;
      const evolutionFactor = Math.random() * 0.1; // Stellar age effects
      
      colors[i3] = Math.min(1.0, selectedType.color[0] + (Math.random() - 0.5) * colorVariation + evolutionFactor);
      colors[i3 + 1] = Math.min(1.0, selectedType.color[1] + (Math.random() - 0.5) * colorVariation);
      colors[i3 + 2] = Math.min(1.0, selectedType.color[2] + (Math.random() - 0.5) * colorVariation - evolutionFactor * 0.5);
      
      // Realistic magnitude distribution following Hipparcos catalog statistics
      const magnitude = Math.random();
      let starSize;
      
      if (magnitude < 0.001) {
        starSize = 18 + Math.random() * 8; // Extremely bright stars (mag < -1)
      } else if (magnitude < 0.005) {
        starSize = 14 + Math.random() * 4; // Very bright stars (mag -1 to 0)
      } else if (magnitude < 0.02) {
        starSize = 10 + Math.random() * 4; // Bright stars (mag 0 to 1)
      } else if (magnitude < 0.08) {
        starSize = 7 + Math.random() * 3; // Moderately bright (mag 1 to 2)
      } else if (magnitude < 0.2) {
        starSize = 5 + Math.random() * 2; // Visible stars (mag 2 to 3)
      } else if (magnitude < 0.4) {
        starSize = 3.5 + Math.random() * 1.5; // Faint visible (mag 3 to 4)
      } else if (magnitude < 0.7) {
        starSize = 2.5 + Math.random() * 1; // Very faint (mag 4 to 5)
      } else {
        starSize = 1.5 + Math.random() * 1; // Barely visible (mag 5+)
      }
      
      // Distance dimming effect
      const distanceDimming = Math.max(0.3, 200 / radius);
      starSize *= distanceDimming;
      
      sizes[i] = starSize;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Enhanced star material with realistic properties
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        varying float vSize;
        uniform float time;
        
        void main() {
          vColor = color;
          vSize = size;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Subtle twinkling effect
          float twinkle = sin(time * 2.0 + position.x * 100.0) * 0.1 + 0.9;
          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Enhanced star core with better falloff
          float coreIntensity = 1.0 - smoothstep(0.0, 0.3, dist);
          float haloIntensity = 0.5 * (1.0 - smoothstep(0.3, 0.5, dist));
          float intensity = coreIntensity + haloIntensity;
          
          // Enhanced diffraction spikes for brighter stars
          if (vSize > 6.0) {
            // Primary spikes
            float spike1 = abs(center.x) < 0.015 ? 1.0 : 0.0;
            float spike2 = abs(center.y) < 0.015 ? 1.0 : 0.0;
            
            // Secondary diagonal spikes for very bright stars
            float spike3 = abs(center.x - center.y) < 0.01 ? 0.6 : 0.0;
            float spike4 = abs(center.x + center.y) < 0.01 ? 0.6 : 0.0;
            
            intensity += (spike1 + spike2) * 0.5 + (spike3 + spike4) * 0.3;
          } else if (vSize > 4.0) {
            float spike1 = abs(center.x) < 0.02 ? 1.0 : 0.0;
            float spike2 = abs(center.y) < 0.02 ? 1.0 : 0.0;
            intensity += (spike1 + spike2) * 0.4;
          }
          
          // Enhanced scintillation with multiple frequencies
          float scintillation = 0.7 + 
            0.2 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) +
            0.1 * sin(gl_FragCoord.x * 0.05 + gl_FragCoord.y * 0.15);
          
          // Brightness boost for better visibility
          float brightnessMultiplier = 1.5 + (vSize / 10.0);
          
          // Enhanced color saturation for brighter stars
          vec3 enhancedColor = vColor;
          if (vSize > 8.0) {
            enhancedColor = mix(vColor, vec3(1.0), 0.2); // Add white core to bright stars
          }
          
          gl_FragColor = vec4(enhancedColor * intensity * scintillation * brightnessMultiplier, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    starsRef.current = stars;
    scene.add(stars);
    
    // Add nebula background for extra realism
    const nebulaGeometry = new THREE.SphereGeometry(200, 32, 32);
    const nebulaMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv * 4.0;
          float n = noise(uv) * 0.5 + noise(uv * 2.0) * 0.25 + noise(uv * 4.0) * 0.125;
          
          vec3 nebulaColor = mix(
            vec3(0.1, 0.05, 0.2),
            vec3(0.3, 0.1, 0.4),
            n
          );
          
          gl_FragColor = vec4(nebulaColor, 0.1);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
    
    // Add additional background nebula layers for enhanced depth
    const nebulaGeometry2 = new THREE.SphereGeometry(800, 32, 32);
    const nebulaMaterial2 = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(15.1234, 67.891))) * 23456.789);
        }
        
        void main() {
          vec2 uv = vUv * 6.0;
          float n = noise(uv) * 0.4 + noise(uv * 3.0) * 0.2 + noise(uv * 6.0) * 0.1;
          
          vec3 nebulaColor = mix(
            vec3(0.05, 0.1, 0.3),
            vec3(0.2, 0.3, 0.6),
            n
          );
          
          gl_FragColor = vec4(nebulaColor, 0.05);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const nebula2 = new THREE.Mesh(nebulaGeometry2, nebulaMaterial2);
    scene.add(nebula2);
    
    // Add distant galaxy-like background
    const galaxyGeometry = new THREE.SphereGeometry(1200, 32, 32);
    const galaxyMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(9.8765, 43.210))) * 12345.678);
        }
        
        void main() {
          vec2 uv = vUv * 8.0;
          float n = noise(uv) * 0.3 + noise(uv * 4.0) * 0.15 + noise(uv * 8.0) * 0.075;
          
          vec3 galaxyColor = mix(
            vec3(0.02, 0.02, 0.08),
            vec3(0.1, 0.05, 0.15),
            n
          );
          
          gl_FragColor = vec4(galaxyColor, 0.03);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    scene.add(galaxy);
    
    // Add realistic Milky Way band
    const milkyWayGeometry = new THREE.SphereGeometry(600, 64, 64);
    const milkyWayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        // Advanced noise functions for realistic galactic structure
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        float turbulence(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 4; i++) {
            value += amplitude * abs(noise(p * frequency) * 2.0 - 1.0);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          // Convert to galactic coordinates
          vec3 pos = normalize(vPosition);
          float galacticLatitude = asin(pos.y);
          float galacticLongitude = atan(pos.z, pos.x);
          
          // Milky Way band intensity based on galactic latitude
          float bandIntensity = exp(-abs(galacticLatitude) * 8.0);
          
          // Create spiral arm structure
          vec2 spiralCoord = vec2(galacticLongitude * 3.0, galacticLatitude * 20.0);
          float spiralNoise = fbm(spiralCoord + vec2(time * 0.01, 0.0));
          
          // Add dust lanes (dark regions)
          vec2 dustCoord = vec2(galacticLongitude * 8.0, galacticLatitude * 40.0);
          float dustLanes = turbulence(dustCoord);
          float dustDarkening = 1.0 - smoothstep(0.3, 0.7, dustLanes) * 0.6;
          
          // Galactic center brightening
          float centerDistance = abs(galacticLongitude);
          float centerBrightening = 1.0 + exp(-centerDistance * 2.0) * 0.8;
          
          // Star-forming regions (bright knots)
          vec2 starFormingCoord = vec2(galacticLongitude * 12.0, galacticLatitude * 30.0);
          float starFormingRegions = smoothstep(0.7, 1.0, fbm(starFormingCoord)) * 0.5;
          
          // Combine all effects
          float intensity = bandIntensity * (0.3 + spiralNoise * 0.4) * dustDarkening * centerBrightening + starFormingRegions;
          
          // Color gradient from center to edge
          vec3 centerColor = vec3(1.0, 0.9, 0.7); // Warm yellow-white (old stars)
          vec3 armColor = vec3(0.7, 0.8, 1.0);    // Blue-white (young stars)
          vec3 dustColor = vec3(0.6, 0.4, 0.3);   // Reddish dust
          
          vec3 milkyWayColor = mix(centerColor, armColor, smoothstep(0.0, 1.0, spiralNoise));
          milkyWayColor = mix(milkyWayColor, dustColor, (1.0 - dustDarkening) * 0.3);
          
          // Add subtle color variations
          milkyWayColor.r += sin(galacticLongitude * 5.0 + time * 0.1) * 0.05;
          milkyWayColor.g += sin(galacticLongitude * 7.0 + time * 0.08) * 0.03;
          milkyWayColor.b += sin(galacticLongitude * 9.0 + time * 0.12) * 0.04;
          
          // Final intensity modulation
          intensity *= 0.15; // Overall brightness control
          
          gl_FragColor = vec4(milkyWayColor * intensity, intensity);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
    scene.add(milkyWay);
    
    // Add bright constellation stars
    const constellationStars = [
      // Orion constellation (visible bright stars)
      { pos: [120, 30, 80], size: 15, color: [0.9, 0.9, 1.0] }, // Rigel
      { pos: [125, 35, 75], size: 12, color: [1.0, 0.7, 0.4] }, // Betelgeuse
      { pos: [122, 32, 78], size: 10, color: [0.9, 0.9, 1.0] }, // Bellatrix
      { pos: [123, 31, 77], size: 8, color: [0.9, 0.9, 1.0] }, // Mintaka
      { pos: [124, 31, 76], size: 8, color: [0.9, 0.9, 1.0] }, // Alnilam
      { pos: [125, 31, 75], size: 8, color: [0.9, 0.9, 1.0] }, // Alnitak
      
      // Big Dipper
      { pos: [-100, 60, 90], size: 12, color: [1.0, 1.0, 0.9] }, // Dubhe
      { pos: [-105, 58, 85], size: 10, color: [1.0, 1.0, 0.9] }, // Merak
      { pos: [-110, 55, 80], size: 9, color: [1.0, 1.0, 0.9] }, // Phecda
      { pos: [-115, 52, 75], size: 11, color: [1.0, 1.0, 0.9] }, // Megrez
      { pos: [-120, 50, 70], size: 10, color: [1.0, 1.0, 0.9] }, // Alioth
      { pos: [-125, 48, 65], size: 9, color: [1.0, 1.0, 0.9] }, // Mizar
      { pos: [-130, 45, 60], size: 11, color: [1.0, 1.0, 0.9] }, // Alkaid
      
      // Southern Cross
      { pos: [80, -70, 120], size: 13, color: [0.8, 0.9, 1.0] }, // Acrux
      { pos: [85, -65, 115], size: 11, color: [1.0, 0.8, 0.6] }, // Gacrux
      { pos: [82, -68, 118], size: 9, color: [0.9, 0.9, 1.0] }, // Imai
      { pos: [87, -62, 112], size: 8, color: [0.9, 0.9, 1.0] }, // Mimosa
      
      // Cassiopeia
      { pos: [-80, 80, 100], size: 10, color: [1.0, 1.0, 0.9] }, // Schedar
      { pos: [-85, 82, 95], size: 9, color: [1.0, 1.0, 0.9] }, // Caph
      { pos: [-90, 84, 90], size: 11, color: [1.0, 1.0, 0.9] }, // Gamma Cas
      { pos: [-95, 86, 85], size: 8, color: [1.0, 1.0, 0.9] }, // Ruchbah
      { pos: [-100, 88, 80], size: 9, color: [1.0, 1.0, 0.9] }, // Segin
    ];
    
    // Create constellation geometry
    const constellationGeometry = new THREE.BufferGeometry();
    const constellationPositions = new Float32Array(constellationStars.length * 3);
    const constellationColors = new Float32Array(constellationStars.length * 3);
    const constellationSizes = new Float32Array(constellationStars.length);
    
    constellationStars.forEach((star, i) => {
      const i3 = i * 3;
      constellationPositions[i3] = star.pos[0];
      constellationPositions[i3 + 1] = star.pos[1];
      constellationPositions[i3 + 2] = star.pos[2];
      
      constellationColors[i3] = star.color[0];
      constellationColors[i3 + 1] = star.color[1];
      constellationColors[i3 + 2] = star.color[2];
      
      constellationSizes[i] = star.size;
    });
    
    constellationGeometry.setAttribute('position', new THREE.BufferAttribute(constellationPositions, 3));
    constellationGeometry.setAttribute('color', new THREE.BufferAttribute(constellationColors, 3));
    constellationGeometry.setAttribute('size', new THREE.BufferAttribute(constellationSizes, 1));
    
    // Enhanced constellation material
    const constellationMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        varying float vSize;
        uniform float time;
        
        void main() {
          vColor = color;
          vSize = size;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Enhanced twinkling for bright stars
          float twinkle = sin(time * 3.0 + position.x * 50.0) * 0.2 + 
                         cos(time * 2.0 + position.y * 30.0) * 0.15 + 0.85;
          gl_PointSize = size * twinkle * (400.0 / -mvPosition.z);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Bright star core with intense glow
          float coreIntensity = 1.0 - smoothstep(0.0, 0.2, dist);
          float haloIntensity = 0.8 * (1.0 - smoothstep(0.2, 0.5, dist));
          float intensity = coreIntensity + haloIntensity;
          
          // Prominent diffraction spikes for constellation stars
          float spike1 = abs(center.x) < 0.02 ? 1.0 : 0.0;
          float spike2 = abs(center.y) < 0.02 ? 1.0 : 0.0;
          float spike3 = abs(center.x - center.y) < 0.015 ? 0.8 : 0.0;
          float spike4 = abs(center.x + center.y) < 0.015 ? 0.8 : 0.0;
          
          intensity += (spike1 + spike2) * 0.6 + (spike3 + spike4) * 0.4;
          
          // Enhanced brightness for constellation visibility
          float brightnessMultiplier = 2.0 + (vSize / 8.0);
          
          gl_FragColor = vec4(vColor * intensity * brightnessMultiplier, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const constellations = new THREE.Points(constellationGeometry, constellationMaterial);
    scene.add(constellations);
    
    // Store constellation reference for animation
    if (!starsRef.current) starsRef.current = {};
    starsRef.current.constellations = constellations;
  }, []);

  // Create realistic sun with solar features
  const createSun = useCallback((scene) => {
    const sunGroup = new THREE.Group();
    
    // Position sun at a realistic distance
    const sunDistance = 300;
    const sunPosition = new THREE.Vector3(sunDistance, 50, 100);
    
    // Main sun sphere with realistic solar surface
    const sunGeometry = new THREE.SphereGeometry(8, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunColor: { value: new THREE.Color(0xffd700) } // Bright golden yellow
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        
        // Solar surface turbulence
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          
          // Add solar surface activity (solar flares and granulation)
          vec3 pos = position;
          float turbulence = noise(pos * 3.0 + time * 0.5) * 0.1 +
                           noise(pos * 6.0 + time * 0.8) * 0.05 +
                           noise(pos * 12.0 + time * 1.2) * 0.025;
          
          pos += normal * turbulence;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Solar granulation pattern
          float granulation = noise(uv * 50.0 + time * 0.1) * 0.3 +
                             noise(uv * 100.0 + time * 0.2) * 0.2 +
                             noise(uv * 200.0 + time * 0.3) * 0.1;
          
          // Solar flare activity
          float flareActivity = sin(time * 2.0 + uv.x * 10.0) * 0.2 +
                               cos(time * 1.5 + uv.y * 8.0) * 0.15;
          
          // Core temperature gradient
          float centerDistance = length(uv - 0.5);
          float temperature = 1.0 - centerDistance * 0.8;
          
          // Enhanced solar color based on realistic temperature
          vec3 coreColor = vec3(1.0, 1.0, 0.95); // Bright white-yellow core
          vec3 surfaceColor = vec3(1.0, 0.84, 0.0); // Golden yellow surface
          vec3 edgeColor = vec3(1.0, 0.6, 0.0); // Orange-yellow edge
          
          vec3 finalColor = mix(edgeColor, surfaceColor, temperature);
          finalColor = mix(finalColor, coreColor, temperature * temperature);
          
          // Add granulation and flare effects
          finalColor += granulation * 0.3;
          finalColor += flareActivity * 0.2;
          
          // Enhanced realistic brightness
          finalColor *= 3.5;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.copy(sunPosition);
    sunGroup.add(sun);
    
    // Solar corona effect
    const coronaGeometry = new THREE.SphereGeometry(12, 32, 32);
    const coronaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          vUv = uv;
          vNormal = normal;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vUv;
          float centerDistance = length(uv - 0.5);
          
          // Corona plasma activity
          float coronaActivity = noise(uv * 20.0 + time * 0.5) * 0.4 +
                                noise(uv * 40.0 + time * 0.8) * 0.3 +
                                noise(uv * 80.0 + time * 1.2) * 0.2;
          
          // Corona intensity falloff
          float coronaIntensity = 1.0 - smoothstep(0.3, 0.5, centerDistance);
          coronaIntensity *= coronaActivity;
          
          // Corona color (hot plasma)
          vec3 coronaColor = vec3(1.0, 0.8, 0.6) * coronaIntensity;
          
          gl_FragColor = vec4(coronaColor, coronaIntensity * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    corona.position.copy(sunPosition);
    sunGroup.add(corona);
    
    // Solar lens flare effect
    const flareGeometry = new THREE.SphereGeometry(20, 16, 16);
    const flareMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          
          // Lens flare rings
          float flare = 0.0;
          for (int i = 1; i <= 5; i++) {
            float ring = float(i) * 0.1;
            flare += 0.1 / abs(dist - ring);
          }
          
          // Pulsing effect
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          flare *= pulse;
          
          vec3 flareColor = vec3(1.0, 0.9, 0.7) * flare * 0.05;
          
          gl_FragColor = vec4(flareColor, flare * 0.02);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    
    const lensFlare = new THREE.Mesh(flareGeometry, flareMaterial);
    lensFlare.position.copy(sunPosition);
    sunGroup.add(lensFlare);
    
    // Add directional light from the sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.copy(sunPosition);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    
    scene.add(sunLight);
    scene.add(sunLight.target);
    
    // Store sun references for animation
    sunGroup.name = 'sunGroup';
    sunGroup.userData = {
      sun,
      corona,
      lensFlare,
      sunMaterial,
      coronaMaterial,
      flareMaterial
    };
    
    scene.add(sunGroup);
    return sunGroup;
  }, []);

  // Create hyperrealistic Earth
  const createEarth = useCallback((scene) => {
    const earthGeometry = new THREE.SphereGeometry(1, 256, 256); // Ultra-high resolution
    
    // Create hyperrealistic Earth texture with detailed surface features
    const canvas = document.createElement('canvas');
    canvas.width = 4096; // Ultra-high resolution
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // Create realistic ocean gradient
    const oceanGradient = ctx.createRadialGradient(2048, 1024, 0, 2048, 1024, 2048);
    oceanGradient.addColorStop(0, '#1e3a8a'); // Deep ocean center
    oceanGradient.addColorStop(0.3, '#1e40af'); // Medium depth
    oceanGradient.addColorStop(0.6, '#2563eb'); // Shallow water
    oceanGradient.addColorStop(1, '#0f172a'); // Deep trenches
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 4096, 2048);
    
    // Add realistic ocean depth variations and currents
    for (let i = 0; i < 25000; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const size = Math.random() * 20 + 2;
      const depth = Math.random();
      
      let oceanColor;
      if (depth < 0.2) {
        oceanColor = '#3b82f6'; // Very shallow water
      } else if (depth < 0.4) {
        oceanColor = '#2563eb'; // Shallow water
      } else if (depth < 0.7) {
        oceanColor = '#1e40af'; // Medium depth
      } else if (depth < 0.9) {
        oceanColor = '#1e3a8a'; // Deep water
      } else {
        oceanColor = '#0c1e3a'; // Abyssal depths
      }
      
      ctx.fillStyle = oceanColor;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add ocean currents and thermal patterns
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 4096;
      const y = Math.random() * 2048;
      const length = Math.random() * 200 + 50;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.strokeStyle = '#1d4ed8';
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
    
    // Generate realistic continental landmasses with detailed geography
    const continents = [
      // North America - more detailed shape
      { 
        x: 600, y: 600, width: 800, height: 600, rotation: -0.2,
        type: 'north_america',
        features: ['great_lakes', 'rocky_mountains', 'appalachians', 'great_plains']
      },
      // South America - elongated with Andes
      { 
        x: 900, y: 1200, width: 400, height: 700, rotation: 0.1,
        type: 'south_america',
        features: ['andes_mountains', 'amazon_basin', 'patagonia']
      },
      // Europe/Asia - massive landmass
      { 
        x: 1800, y: 500, width: 1600, height: 800, rotation: 0,
        type: 'eurasia',
        features: ['himalayas', 'siberia', 'alps', 'urals', 'scandinavian_mountains']
      },
      // Africa - distinctive shape
      { 
        x: 1600, y: 900, width: 600, height: 900, rotation: 0,
        type: 'africa',
        features: ['sahara', 'rift_valley', 'atlas_mountains', 'kalahari']
      },
      // Australia - island continent
      { x: 1400, y: 700, width: 250, height: 150, rotation: 0 },
      // Antarctica
      { x: 1024, y: 950, width: 1000, height: 100, rotation: 0 }
    ];
    
    continents.forEach(continent => {
      ctx.save();
      ctx.translate(continent.x, continent.y);
      ctx.rotate(continent.rotation);
      
      // Create realistic continent base with biome variations
      const biomeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(continent.width, continent.height));
      
      // Enhanced biome patterns with higher contrast and realistic colors
      if (continent.type === 'africa') {
        biomeGradient.addColorStop(0, '#f59e0b'); // Bright Sahara desert
        biomeGradient.addColorStop(0.2, '#d97706'); // Desert edges
        biomeGradient.addColorStop(0.4, '#eab308'); // Sahel savanna
        biomeGradient.addColorStop(0.6, '#65a30d'); // Tropical grasslands
        biomeGradient.addColorStop(0.8, '#166534'); // Dense tropical forests
        biomeGradient.addColorStop(1, '#064e3b'); // Coastal rainforests
      } else if (continent.type === 'eurasia') {
        biomeGradient.addColorStop(0, '#f3f4f6'); // Bright Siberian tundra
        biomeGradient.addColorStop(0.15, '#d1d5db'); // Arctic regions
        biomeGradient.addColorStop(0.3, '#166534'); // Dense taiga forests
        biomeGradient.addColorStop(0.5, '#22c55e'); // Temperate forests
        biomeGradient.addColorStop(0.7, '#eab308'); // Central Asian steppes
        biomeGradient.addColorStop(0.85, '#a16207'); // Desert regions
        biomeGradient.addColorStop(1, '#78716c'); // Mountain ranges
      } else if (continent.type === 'north_america') {
        biomeGradient.addColorStop(0, '#f3f4f6'); // Bright Arctic tundra
        biomeGradient.addColorStop(0.2, '#d1d5db'); // Northern Canada
        biomeGradient.addColorStop(0.4, '#166534'); // Dense boreal forests
        biomeGradient.addColorStop(0.6, '#22c55e'); // Temperate deciduous forests
        biomeGradient.addColorStop(0.8, '#eab308'); // Great Plains grasslands
        biomeGradient.addColorStop(1, '#78716c'); // Rocky Mountains
      } else if (continent.type === 'south_america') {
        biomeGradient.addColorStop(0, '#78716c'); // High Andes Mountains
        biomeGradient.addColorStop(0.2, '#a3a3a3'); // Andean foothills
        biomeGradient.addColorStop(0.4, '#064e3b'); // Dense Amazon rainforest
        biomeGradient.addColorStop(0.6, '#166534'); // Atlantic coastal forests
        biomeGradient.addColorStop(0.8, '#eab308'); // Pampas grasslands
        biomeGradient.addColorStop(1, '#d1d5db'); // Patagonian steppes
      } else {
        // Enhanced default gradient for other continents
        biomeGradient.addColorStop(0, '#22c55e'); // Bright green
        biomeGradient.addColorStop(0.3, '#166534'); // Dark forest green
        biomeGradient.addColorStop(0.7, '#eab308'); // Golden grasslands
        biomeGradient.addColorStop(1, '#a16207'); // Brown highlands
      }
      
      ctx.fillStyle = biomeGradient;
      
      // Draw continent with irregular, realistic coastline
      ctx.beginPath();
      const points = 50;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const baseRadius = Math.min(continent.width, continent.height) / 2;
        const variation = 0.3 + Math.random() * 0.4; // Coastline irregularity
        const radius = baseRadius * variation;
        
        const x = Math.cos(angle) * radius * (continent.width / continent.height);
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Add continent borders for better visibility
      ctx.strokeStyle = '#374151'; // Dark gray border
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      
      // Add major geographical features
      if (continent.features) {
        continent.features.forEach(feature => {
          switch (feature) {
            case 'himalayas':
              // Draw Himalayan mountain range
              for (let i = 0; i < 15; i++) {
                const mx = (Math.random() - 0.5) * continent.width * 0.6;
                const my = (Math.random() - 0.5) * continent.height * 0.3;
                const mSize = Math.random() * 40 + 20;
                
                ctx.fillStyle = '#f8fafc'; // Snow-capped peaks
                ctx.beginPath();
                ctx.arc(mx, my, mSize, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
              
            case 'sahara':
              // Draw Sahara desert
              ctx.fillStyle = '#fbbf24';
              ctx.globalAlpha = 0.7;
              ctx.fillRect(-continent.width * 0.3, -continent.height * 0.4, continent.width * 0.6, continent.height * 0.3);
              ctx.globalAlpha = 1.0;
              break;
              
            case 'amazon_basin':
              // Draw Amazon rainforest
              ctx.fillStyle = '#059669';
              ctx.globalAlpha = 0.8;
              ctx.fillRect(-continent.width * 0.2, -continent.height * 0.2, continent.width * 0.4, continent.height * 0.4);
              ctx.globalAlpha = 1.0;
              break;
              
            case 'great_lakes':
              // Draw Great Lakes
              for (let i = 0; i < 5; i++) {
                const lx = (Math.random() - 0.5) * continent.width * 0.3;
                const ly = (Math.random() - 0.5) * continent.height * 0.2;
                const lSize = Math.random() * 15 + 8;
                
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(lx, ly, lSize, 0, Math.PI * 2);
                ctx.fill();
              }
              break;
              
            case 'andes_mountains':
              // Draw Andes mountain range
              for (let i = 0; i < 20; i++) {
                const mx = -continent.width * 0.4 + (Math.random() * 0.2 * continent.width);
                const my = (Math.random() - 0.5) * continent.height * 0.8;
                const mSize = Math.random() * 25 + 15;
                
                ctx.fillStyle = '#78716c';
                ctx.beginPath();
                ctx.arc(mx, my, mSize, 0, Math.PI * 2);
                ctx.fill();
                
                // Snow caps
                if (Math.random() > 0.6) {
                  ctx.fillStyle = '#f8fafc';
                  ctx.beginPath();
                  ctx.arc(mx, my - mSize * 0.3, mSize * 0.4, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              break;
          }
        });
      }
      
      // Add general mountain ranges for realism
      const mountainCount = continent.type === 'eurasia' ? 40 : 25;
      for (let i = 0; i < mountainCount; i++) {
        const mx = (Math.random() - 0.5) * continent.width * 0.8;
        const my = (Math.random() - 0.5) * continent.height * 0.8;
        const mSize = Math.random() * 20 + 8;
        
        ctx.fillStyle = '#78716c'; // Mountain color
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(mx, my, mSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Snow caps on high mountains
        if (Math.random() > 0.7) {
          ctx.fillStyle = '#f8fafc';
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(mx, my - mSize * 0.3, mSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1.0;
      
      // Add forests
      for (let i = 0; i < 50; i++) {
        const fx = (Math.random() - 0.5) * continent.width * 0.9;
        const fy = (Math.random() - 0.5) * continent.height * 0.9;
        const fSize = Math.random() * 15 + 5;
        
        ctx.fillStyle = '#15803d'; // Forest green
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add deserts
      for (let i = 0; i < 30; i++) {
        const dx = (Math.random() - 0.5) * continent.width * 0.7;
        const dy = (Math.random() - 0.5) * continent.height * 0.7;
        const dSize = Math.random() * 25 + 10;
        
        ctx.fillStyle = '#eab308'; // Desert sand
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(dx, dy, dSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1.0;
      ctx.restore();
    });
    
    // Add polar ice caps
    const iceGradient = ctx.createRadialGradient(1024, 50, 0, 1024, 50, 200);
    iceGradient.addColorStop(0, '#f8fafc');
    iceGradient.addColorStop(0.7, '#e2e8f0');
    iceGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = iceGradient;
    ctx.fillRect(824, 0, 400, 150); // North pole
    
    const southIceGradient = ctx.createRadialGradient(1024, 974, 0, 1024, 974, 200);
    southIceGradient.addColorStop(0, '#f8fafc');
    southIceGradient.addColorStop(0.7, '#e2e8f0');
    southIceGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = southIceGradient;
    ctx.fillRect(824, 874, 400, 150); // South pole
    
    // Add atmospheric effects and city lights
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const size = Math.random() * 2 + 0.5;
      
      ctx.fillStyle = '#fbbf24'; // City lights
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1.0;
    
    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Create normal map for surface detail
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = 1024;
    normalCanvas.height = 512;
    const normalCtx = normalCanvas.getContext('2d');
    
    // Generate height-based normal map
    const imageData = normalCtx.createImageData(1024, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.3 + 0.7;
      imageData.data[i] = 128 + noise * 50;     // R (X normal)
      imageData.data[i + 1] = 128 + noise * 50; // G (Y normal)
      imageData.data[i + 2] = 255;              // B (Z normal)
      imageData.data[i + 3] = 255;              // A
    }
    normalCtx.putImageData(imageData, 0, 0);
    
    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    
    // Enhanced Earth material with realistic properties
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: 0.8,
      metalness: 0.1,
      emissive: new THREE.Color(0x112233),
      emissiveIntensity: 0.1
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;
    earth.castShadow = true;
    earthRef.current = earth;
    scene.add(earth);
  }, []);

  // Create atmosphere glow
  const createAtmosphere = useCallback((scene) => {
    const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);
  }, []);

  // Create cloud layer
  const createClouds = useCallback((scene) => {
    const cloudGeometry = new THREE.SphereGeometry(1.005, 64, 64);
    
    // Create procedural cloud texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create cloud pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 512, 256);
    
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const size = Math.random() * 30 + 10;
      const opacity = Math.random() * 0.5 + 0.1;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const cloudTexture = new THREE.CanvasTexture(canvas);
    
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4
    });
    
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudsRef.current = clouds;
    scene.add(clouds);
  }, []);

  // Orbital mechanics utilities
  const orbitalMechanics = {
    EARTH_RADIUS: 6371, // km
    MU: 398600.4418, // Earth's gravitational parameter (km³/s²)
    
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
      const radius = (orbitalMechanics.EARTH_RADIUS + altitude) / orbitalMechanics.EARTH_RADIUS; // Normalized
      
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
    }
  };

  // Create realistic satellite trajectories with orbital mechanics
  const createSatellites = useCallback(() => {
    if (!satellitesGroupRef.current) return;
    
    // Clear existing satellites
    while (satellitesGroupRef.current.children.length > 0) {
      satellitesGroupRef.current.remove(satellitesGroupRef.current.children[0]);
    }
    
    satellites.forEach((satellite, index) => {
      // Enhanced satellite data with orbital elements
      const satData = {
        altitude: satellite.altitude || (400 + Math.random() * 1000),
        inclination: satellite.inclination || Math.random() * 180,
        raan: satellite.longitude || Math.random() * 360,
        argOfPerigee: Math.random() * 360,
        meanAnomaly: Math.random() * 360,
        ...satellite
      };
      
      // Calculate initial position using orbital mechanics
      const position = orbitalMechanics.orbitalToCartesian(
        satData.altitude,
        satData.inclination,
        satData.raan,
        satData.argOfPerigee,
        satData.meanAnomaly
      );
      
      // Create enhanced satellite model
      const satelliteGroup = new THREE.Group();
      
      // Main satellite body
      const satelliteGeometry = new THREE.BoxGeometry(0.02, 0.01, 0.03);
      const satelliteMaterial = new THREE.MeshStandardMaterial({
        color: satellite.status === 'active' ? 0x00ff88 : 0xff4444,
        emissive: satellite.status === 'active' ? 0x002211 : 0x221100,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const satelliteMesh = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
      satelliteGroup.add(satelliteMesh);
      
      // Solar panels
      const panelGeometry = new THREE.BoxGeometry(0.06, 0.001, 0.02);
      const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x001133,
        metalness: 0.9,
        roughness: 0.1
      });
      
      const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      leftPanel.position.set(-0.04, 0, 0);
      satelliteGroup.add(leftPanel);
      
      const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
      rightPanel.position.set(0.04, 0, 0);
      satelliteGroup.add(rightPanel);
      
      // Communication antenna
      const antennaGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.02);
      const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 1.0,
        roughness: 0.1
      });
      
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(0, 0.015, 0);
      satelliteGroup.add(antenna);
      
      // Position satellite
      satelliteGroup.position.set(position.x, position.y, position.z);
      satelliteGroup.userData = { 
        type: 'satellite', 
        data: satData,
        meanAnomaly: satData.meanAnomaly * Math.PI / 180,
        meanMotion: orbitalMechanics.calculateMeanMotion(satData.altitude)
      };
      
      // Create enhanced 3D orbital path with prediction
      const orbitPoints = [];
      const futureOrbitPoints = [];
      const segments = 128;
      
      // Current orbit (full circle)
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const orbitPos = orbitalMechanics.orbitalToCartesian(
          satData.altitude,
          satData.inclination,
          satData.raan,
          satData.argOfPerigee,
          angle * 180 / Math.PI
        );
        orbitPoints.push(new THREE.Vector3(orbitPos.x, orbitPos.y, orbitPos.z));
      }
      
      // Future orbit prediction (next 2 orbits with slight perturbations)
      for (let orbit = 1; orbit <= 2; orbit++) {
        for (let i = 0; i <= 50; i++) {
          const angle = (i / 50) * 2 * Math.PI;
          const perturbation = orbit * 0.002; // Slight orbital decay/drift
          const orbitPos = orbitalMechanics.orbitalToCartesian(
            satData.altitude - perturbation * 10,
            satData.inclination + perturbation,
            satData.raan + perturbation * 5,
            satData.argOfPerigee,
            angle * 180 / Math.PI
          );
          futureOrbitPoints.push(new THREE.Vector3(orbitPos.x, orbitPos.y, orbitPos.z));
        }
      }
      
      // Current orbit line
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: satellite.status === 'active' ? 0x00ff88 : 0xff4444,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      
      // Future orbit prediction lines
      const futureOrbitGeometry = new THREE.BufferGeometry().setFromPoints(futureOrbitPoints);
      const futureOrbitMaterial = new THREE.LineBasicMaterial({
        color: satellite.status === 'active' ? 0x88ff00 : 0xff8844,
        transparent: true,
        opacity: 0.3,
        linewidth: 1
      });
      const futureOrbitLine = new THREE.Line(futureOrbitGeometry, futureOrbitMaterial);
      
      // Enhanced tracking indicators
      const trackingGroup = new THREE.Group();
      
      // Orbital direction indicator
      const directionGeometry = new THREE.ConeGeometry(0.015, 0.04, 8);
      const directionMaterial = new THREE.MeshBasicMaterial({
        color: satellite.status === 'active' ? 0x00ff88 : 0xff4444,
        transparent: true,
        opacity: 0.9
      });
      const directionIndicator = new THREE.Mesh(directionGeometry, directionMaterial);
      
      // Velocity vector indicator
      const velocityGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.1);
      const velocityMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.7
      });
      const velocityIndicator = new THREE.Mesh(velocityGeometry, velocityMaterial);
      
      // Ground track projection
      const groundTrackGeometry = new THREE.SphereGeometry(1.001, 16, 16);
      const groundTrackMaterial = new THREE.MeshBasicMaterial({
        color: satellite.status === 'active' ? 0x00ff88 : 0xff4444,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      });
      const groundTrack = new THREE.Mesh(groundTrackGeometry, groundTrackMaterial);
      
      // Communication range indicator
      const commRangeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const commRangeMaterial = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      });
      const commRange = new THREE.Mesh(commRangeGeometry, commRangeMaterial);
      
      // Position all tracking elements
      directionIndicator.position.copy(satelliteGroup.position);
      velocityIndicator.position.copy(satelliteGroup.position);
      commRange.position.copy(satelliteGroup.position);
      
      // Set initial orientations
      directionIndicator.lookAt(
        satelliteGroup.position.x + 0.1,
        satelliteGroup.position.y,
        satelliteGroup.position.z
      );
      
      trackingGroup.add(directionIndicator);
      trackingGroup.add(velocityIndicator);
      trackingGroup.add(commRange);
      
      // Store tracking data for animation updates
      satelliteGroup.userData.tracking = {
        directionIndicator,
        velocityIndicator,
        commRange,
        orbitLine,
        futureOrbitLine,
        groundTrack
      };
      
      satellitesGroupRef.current.add(satelliteGroup);
       satellitesGroupRef.current.add(orbitLine);
       satellitesGroupRef.current.add(futureOrbitLine);
       satellitesGroupRef.current.add(trackingGroup);
       satellitesGroupRef.current.add(groundTrack);
    });
  }, [satellites]);

  // Create debris visualization
  const createDebris = useCallback(() => {
    if (!debrisGroupRef.current) return;
    
    // Clear existing debris
    while (debrisGroupRef.current.children.length > 0) {
      debrisGroupRef.current.remove(debrisGroupRef.current.children[0]);
    }
    
    debris.forEach((debrisItem, index) => {
      // Convert lat/lng to 3D position
      const phi = (90 - debrisItem.latitude) * Math.PI / 180;
      const theta = (debrisItem.longitude + 180) * Math.PI / 180;
      const radius = 1.08; // Slightly above Earth surface
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      // Create debris geometry
      const debrisGeometry = new THREE.SphereGeometry(0.005, 6, 6);
      const debrisMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4444, // Red for debris
        emissive: 0x220000,
        emissiveIntensity: 0.3
      });
      
      const debrisMesh = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debrisMesh.position.set(x, y, z);
      debrisMesh.userData = { type: 'debris', data: debrisItem };
      
      debrisGroupRef.current.add(debrisMesh);
    });
  }, [debris]);

  // Enhanced animation loop with real-time tracking
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
    
    // Only continue animation if playing
    if (isPlaying) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
    
    const time = Date.now() * 0.001;
    
    if (isPlaying) {
      // Rotate Earth
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.001;
      }
      
      // Rotate clouds slightly faster with realistic movement
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0015;
        // Add subtle vertical movement
        cloudsRef.current.position.y = Math.sin(time * 0.1) * 0.001;
      }
      
      // Animate satellites with enhanced tracking
      if (satellitesGroupRef.current) {
        const deltaTime = 0.016; // Approximate frame time (60 FPS)
        const timeAcceleration = 100; // Speed up orbital motion for visualization
        
        satellitesGroupRef.current.children.forEach((child, index) => {
          if (child.userData.type === 'satellite' && child.userData.data) {
            const satData = child.userData.data;
            
            // Update mean anomaly based on orbital motion
            child.userData.meanAnomaly += child.userData.meanMotion * deltaTime * timeAcceleration;
            
            // Calculate new position using orbital mechanics
            const newPosition = orbitalMechanics.orbitalToCartesian(
              satData.altitude,
              satData.inclination,
              satData.raan,
              satData.argOfPerigee,
              child.userData.meanAnomaly * 180 / Math.PI
            );
            
            // Calculate velocity vector for direction
            const nextAnomaly = child.userData.meanAnomaly + 0.01;
            const nextPosition = orbitalMechanics.orbitalToCartesian(
              satData.altitude,
              satData.inclination,
              satData.raan,
              satData.argOfPerigee,
              nextAnomaly * 180 / Math.PI
            );
            
            const velocity = new THREE.Vector3(
              nextPosition.x - newPosition.x,
              nextPosition.y - newPosition.y,
              nextPosition.z - newPosition.z
            ).normalize();
            
            // Smooth position transition
            child.position.lerp(
              new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z),
              0.1
            );
            
            // Update tracking indicators if they exist
            if (child.userData.tracking) {
              const tracking = child.userData.tracking;
              
              // Update direction indicator
              if (tracking.directionIndicator) {
                tracking.directionIndicator.position.copy(child.position);
                tracking.directionIndicator.lookAt(
                  child.position.x + velocity.x * 0.1,
                  child.position.y + velocity.y * 0.1,
                  child.position.z + velocity.z * 0.1
                );
              }
              
              // Update velocity indicator
              if (tracking.velocityIndicator) {
                tracking.velocityIndicator.position.copy(child.position);
                tracking.velocityIndicator.lookAt(
                  child.position.x + velocity.x * 0.2,
                  child.position.y + velocity.y * 0.2,
                  child.position.z + velocity.z * 0.2
                );
              }
              
              // Update communication range
              if (tracking.commRange) {
                tracking.commRange.position.copy(child.position);
                // Pulse effect for communication range
                const pulseScale = 1 + Math.sin(time * 2 + index) * 0.1;
                tracking.commRange.scale.setScalar(pulseScale);
              }
              
              // Update orbit line opacity based on satellite activity
              if (tracking.orbitLine) {
                const activityPulse = 0.4 + Math.sin(time * 3 + index) * 0.2;
                tracking.orbitLine.material.opacity = satData.status === 'active' ? activityPulse : 0.2;
              }
              
              // Update future orbit prediction
              if (tracking.futureOrbitLine) {
                const predictionPulse = 0.2 + Math.sin(time * 1.5 + index) * 0.1;
                tracking.futureOrbitLine.material.opacity = predictionPulse;
              }
            }
            
            // Rotate satellite to face direction of motion
            child.lookAt(child.position.clone().add(velocity));
            
            // Add subtle rotation for realism
            child.rotation.z += 0.01;
            
            // Add slight wobble for realistic satellite movement
            const wobble = Math.sin(time * 5 + index) * 0.001;
            child.position.x += wobble;
            child.position.y += wobble * 0.5;
          }
        });
      }
      
      // Animate debris
      if (debrisGroupRef.current) {
        debrisGroupRef.current.children.forEach((child, index) => {
          if (child.userData.type === 'debris') {
            const radius = 1.08;
            const speed = 0.3 + (index % 5) * 0.1; // Different speeds for variety
            
            const angle = time * speed + index * 0.5;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            
            child.position.x = x;
            child.position.z = z;
          }
        });
      }
      
      // Animate stars with enhanced twinkling effect
      if (starsRef.current) {
        if (starsRef.current.material && starsRef.current.material.uniforms) {
          starsRef.current.material.uniforms.time.value = time;
          // Add subtle rotation to star field
          starsRef.current.rotation.y += 0.00005;
        }
        
        // Animate constellation stars
        if (starsRef.current.constellations) {
          starsRef.current.constellations.material.uniforms.time.value = time;
          // Slightly different rotation for depth effect
          starsRef.current.constellations.rotation.y += 0.00003;
        }
      }
      
      // Animate Milky Way band
      if (sceneRef.current) {
        sceneRef.current.children.forEach(child => {
          if (child.material && child.material.uniforms && child.material.uniforms.time) {
            // Update time for Milky Way and nebula materials
            child.material.uniforms.time.value = time;
          }
        });
      }
      

    }
    
    // Handle satellite tracking camera movement
    if (isTracking && trackedSatellite && cameraRef.current) {
      // Find the tracked satellite in the scene
      let trackedMesh = null;
      if (satellitesGroupRef.current) {
        satellitesGroupRef.current.children.forEach(child => {
          if (child.userData.type === 'satellite' && 
              child.userData.data && 
              child.userData.data.id === trackedSatellite.id) {
            trackedMesh = child;
          }
        });
      }
      
      if (trackedMesh) {
        // Calculate optimal camera position for tracking
        const satellitePosition = trackedMesh.position.clone();
        const earthCenter = new THREE.Vector3(0, 0, 0);
        
        // Calculate direction from Earth to satellite
        const directionToSatellite = satellitePosition.clone().normalize();
        
        // Position camera behind and slightly above the satellite
        const cameraOffset = directionToSatellite.clone().multiplyScalar(0.3); // Distance behind satellite
        const upOffset = new THREE.Vector3(0, 0.1, 0); // Slight upward offset
        
        const targetCameraPosition = satellitePosition.clone().add(cameraOffset).add(upOffset);
        
        // Smooth camera movement using lerp
        cameraRef.current.position.lerp(targetCameraPosition, 0.05);
        
        // Make camera look at the satellite
        const lookAtTarget = satellitePosition.clone();
        
        // Add slight lead to the look-at target for better tracking feel
        if (trackedMesh.userData.velocity) {
          lookAtTarget.add(trackedMesh.userData.velocity.clone().multiplyScalar(0.1));
        }
        
        cameraRef.current.lookAt(lookAtTarget);
        
        // Update controls target to satellite position
        if (controlsRef.current) {
          controlsRef.current.target.copy(satellitePosition);
        }
      }
    }
    
    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [isPlaying, isTracking, trackedSatellite]);

  // Fullscreen functionality
  const toggleFullscreen = useCallback(() => {
    console.log('Fullscreen button clicked, current fullscreen state:', !!document.fullscreenElement);
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (mountRef.current?.requestFullscreen) {
        mountRef.current.requestFullscreen();
      } else if (mountRef.current?.webkitRequestFullscreen) {
        mountRef.current.webkitRequestFullscreen();
      } else if (mountRef.current?.msRequestFullscreen) {
        mountRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      
      // Resize renderer when entering/exiting fullscreen
      if (rendererRef.current && cameraRef.current) {
        const container = mountRef.current;
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle play/pause state changes
  useEffect(() => {
    if (isPlaying && globeReady) {
      // Restart animation when play is pressed
      if (!animationIdRef.current) {
        animate();
      }
    } else {
      // Stop animation when pause is pressed
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }
  }, [isPlaying, globeReady, animate]);

  // Initialize scene on mount
  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Update satellites when data changes
  useEffect(() => {
    if (globeReady) {
      createSatellites();
    }
  }, [satellites, globeReady, createSatellites]);

  // Update debris when data changes
  useEffect(() => {
    if (globeReady) {
      createDebris();
    }
  }, [debris, globeReady, createDebris]);

  // Handle mouse clicks for object selection
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    
    const handleClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const intersects = raycaster.intersectObjects([
        ...satellitesGroupRef.current.children,
        ...debrisGroupRef.current.children
      ]);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.data) {
          // Call the original onObjectSelect callback
          if (onObjectSelect) {
            onObjectSelect(object.userData.data);
          }
          
          // Handle satellite tracking
          if (object.userData.type === 'satellite') {
            if (trackedSatellite && trackedSatellite.id === object.userData.data.id) {
              // Stop tracking if clicking the same satellite
              setTrackedSatellite(null);
              setIsTracking(false);
              
              // Reset camera controls
              if (controlsRef.current) {
                controlsRef.current.enabled = true;
                controlsRef.current.autoRotate = false;
              }
            } else {
              // Start tracking new satellite
              setTrackedSatellite(object.userData.data);
              setIsTracking(true);
              
              // Store reference to the 3D object for tracking
              object.userData.data.meshRef = object;
              
              // Disable manual camera controls during tracking
              if (controlsRef.current) {
                controlsRef.current.enabled = false;
              }
            }
          }
        }
      } else {
        // Click on empty space - stop tracking
        if (isTracking) {
          setTrackedSatellite(null);
          setIsTracking(false);
          
          // Re-enable camera controls
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.autoRotate = false;
          }
        }
      }
    };
    
    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [onObjectSelect, globeReady, trackedSatellite, isTracking]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
            <p>Loading Hyperrealistic Globe...</p>
          </div>
        </div>
      )}
      
      {/* Three.js mount point */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Controls */}
      {showControls && globeReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 glass-card p-4 space-y-3 z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Play/Pause button clicked, current state:', isPlaying);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center space-x-2 w-full px-3 py-2 bg-neon-blue bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4 text-neon-blue" />
            ) : (
              <PlayIcon className="w-4 h-4 text-neon-blue" />
            )}
            <span className="text-sm text-white">
              {isPlaying ? 'Pause' : 'Play'}
            </span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="flex items-center space-x-2 w-full px-3 py-2 bg-purple-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-4 h-4 text-purple-400" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-sm text-white">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>
          
          <div className="text-xs text-gray-400 space-y-1">
            <div>Satellites: <span className="text-green-400">{satellites.length}</span></div>
            <div>Debris: <span className="text-red-400">{debris.length}</span></div>
            <div>Status: <span className="text-neon-blue">{isPlaying ? 'Playing' : 'Paused'}</span></div>
          </div>
        </motion.div>
      )}
      
      {/* Globe status indicator */}
      <div className="absolute bottom-4 left-4 glass-card p-3">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <SunIcon className="w-4 h-4 text-neon-blue" />
          <span>Hyperrealistic 3D Globe</span>
          <div className={`w-2 h-2 rounded-full animate-pulse ${globeReady ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default HyperrealisticGlobe;