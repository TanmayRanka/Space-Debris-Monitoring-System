import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import json

class CollisionPredictor:
    """Service for predicting collisions and analyzing orbital risks"""
    
    def __init__(self):
        self.earth_radius = 6371.0  # km
        self.mu = 398600.4418  # Earth's gravitational parameter (km³/s²)
        self.collision_threshold = 5.0  # km - minimum safe distance
        
    def get_alerts(self, severity='all') -> List[Dict]:
        """Get collision alerts with optional severity filtering"""
        alerts = self._generate_collision_alerts()
        
        if severity != 'all':
            alerts = [alert for alert in alerts if alert['severity'] == severity]
        
        # Sort by severity and time to closest approach
        severity_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        alerts.sort(key=lambda x: (severity_order.get(x['severity'], 1), x['time_to_approach']), reverse=True)
        
        return alerts
    
    def simulate_launch(self, rocket_name: str, payload: str, orbit_type: str, launch_site: str) -> Dict:
        """Simulate rocket launch and predict orbital insertion"""
        
        # Get rocket specifications
        rocket_specs = self._get_rocket_specs(rocket_name)
        if not rocket_specs:
            raise ValueError(f"Unknown rocket: {rocket_name}")
        
        # Calculate target orbit parameters
        target_orbit = self._calculate_target_orbit(orbit_type, rocket_specs)
        
        # Simulate launch trajectory
        launch_trajectory = self._simulate_launch_trajectory(launch_site, target_orbit)
        
        # Analyze collision risks during launch and orbit
        collision_analysis = self._analyze_launch_risks(launch_trajectory, target_orbit)
        
        # Generate mission timeline
        mission_timeline = self._generate_mission_timeline(launch_trajectory, target_orbit)
        
        return {
            'mission_id': f"MISSION_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'rocket': rocket_specs,
            'payload': {
                'name': payload,
                'mass': random.uniform(1000, 5000),  # kg
                'type': self._classify_payload(payload)
            },
            'target_orbit': target_orbit,
            'launch_site': self._get_launch_site_info(launch_site),
            'trajectory': launch_trajectory,
            'collision_analysis': collision_analysis,
            'timeline': mission_timeline,
            'success_probability': self._calculate_success_probability(collision_analysis),
            'recommendations': self._generate_recommendations(collision_analysis),
            'simulation_timestamp': datetime.utcnow().isoformat()
        }
    
    def analyze_conjunction(self, object1_id: str, object2_id: str) -> Dict:
        """Analyze potential conjunction between two space objects"""
        
        # Mock orbital data for demonstration
        obj1_orbit = self._get_mock_orbital_data(object1_id)
        obj2_orbit = self._get_mock_orbital_data(object2_id)
        
        # Calculate closest approach
        closest_approach = self._calculate_closest_approach(obj1_orbit, obj2_orbit)
        
        # Assess collision probability
        collision_prob = self._calculate_collision_probability(closest_approach)
        
        # Generate avoidance maneuvers if needed
        avoidance_options = []
        if collision_prob > 0.001:  # 0.1% threshold
            avoidance_options = self._generate_avoidance_maneuvers(obj1_orbit, obj2_orbit, closest_approach)
        
        return {
            'object1': obj1_orbit,
            'object2': obj2_orbit,
            'closest_approach': closest_approach,
            'collision_probability': collision_prob,
            'risk_level': self._assess_risk_level(collision_prob, closest_approach['distance']),
            'avoidance_options': avoidance_options,
            'monitoring_recommendations': self._generate_monitoring_recommendations(collision_prob),
            'analysis_timestamp': datetime.utcnow().isoformat()
        }
    
    def predict_debris_evolution(self, debris_field: List[Dict], time_horizon_days: int = 30) -> Dict:
        """Predict evolution of debris field over time"""
        
        predictions = []
        current_time = datetime.utcnow()
        
        for day in range(0, time_horizon_days + 1, 7):  # Weekly predictions
            prediction_time = current_time + timedelta(days=day)
            
            # Simulate debris evolution
            evolved_debris = []
            for debris in debris_field:
                evolved_state = self._evolve_debris_orbit(debris, day)
                evolved_debris.append(evolved_state)
            
            # Calculate density hotspots
            hotspots = self._calculate_density_hotspots(evolved_debris)
            
            predictions.append({
                'timestamp': prediction_time.isoformat(),
                'day': day,
                'debris_count': len(evolved_debris),
                'density_hotspots': hotspots,
                'risk_zones': self._identify_risk_zones(evolved_debris),
                'collision_probability': self._calculate_field_collision_probability(evolved_debris)
            })
        
        return {
            'predictions': predictions,
            'summary': self._generate_evolution_summary(predictions),
            'recommendations': self._generate_debris_recommendations(predictions),
            'confidence_level': 0.75,  # Mock confidence
            'prediction_timestamp': datetime.utcnow().isoformat()
        }
    
    def _generate_collision_alerts(self) -> List[Dict]:
        """Generate realistic collision alerts"""
        alerts = []
        
        # High-priority alerts
        critical_alerts = [
            {
                'id': 'ALERT_001',
                'severity': 'critical',
                'object1': {'name': 'ISS (ZARYA)', 'id': 25544, 'type': 'satellite'},
                'object2': {'name': 'COSMOS 2251 DEB #047', 'id': 34454, 'type': 'debris'},
                'closest_approach_time': (datetime.utcnow() + timedelta(hours=8)).isoformat(),
                'miss_distance': 0.8,  # km
                'collision_probability': 0.045,
                'altitude': 408,
                'relative_velocity': 14.2,  # km/s
                'time_to_approach': 8 * 3600,  # seconds
                'status': 'active',
                'created_at': (datetime.utcnow() - timedelta(hours=2)).isoformat()
            },
            {
                'id': 'ALERT_002',
                'severity': 'high',
                'object1': {'name': 'STARLINK-1130', 'id': 44713, 'type': 'satellite'},
                'object2': {'name': 'FENGYUN 1C DEB #1234', 'id': 30000, 'type': 'debris'},
                'closest_approach_time': (datetime.utcnow() + timedelta(hours=24)).isoformat(),
                'miss_distance': 1.2,
                'collision_probability': 0.023,
                'altitude': 550,
                'relative_velocity': 12.8,
                'time_to_approach': 24 * 3600,
                'status': 'monitoring',
                'created_at': (datetime.utcnow() - timedelta(hours=6)).isoformat()
            }
        ]
        
        # Medium priority alerts
        medium_alerts = []
        for i in range(5):
            alert = {
                'id': f'ALERT_{i+10:03d}',
                'severity': 'medium',
                'object1': {
                    'name': f'SATELLITE-{random.randint(1000, 9999)}',
                    'id': random.randint(20000, 50000),
                    'type': 'satellite'
                },
                'object2': {
                    'name': f'DEBRIS-{random.randint(1000, 9999)}',
                    'id': random.randint(30000, 60000),
                    'type': 'debris'
                },
                'closest_approach_time': (datetime.utcnow() + timedelta(hours=random.randint(12, 72))).isoformat(),
                'miss_distance': random.uniform(2.0, 5.0),
                'collision_probability': random.uniform(0.001, 0.01),
                'altitude': random.uniform(400, 1500),
                'relative_velocity': random.uniform(8.0, 15.0),
                'time_to_approach': random.randint(12, 72) * 3600,
                'status': random.choice(['active', 'monitoring']),
                'created_at': (datetime.utcnow() - timedelta(hours=random.randint(1, 12))).isoformat()
            }
            medium_alerts.append(alert)
        
        alerts.extend(critical_alerts)
        alerts.extend(medium_alerts)
        
        return alerts
    
    def _get_rocket_specs(self, rocket_name: str) -> Optional[Dict]:
        """Get rocket specifications"""
        rockets = {
            'Falcon 9': {
                'name': 'Falcon 9',
                'manufacturer': 'SpaceX',
                'height': 70,  # meters
                'diameter': 3.7,
                'mass': 549054,  # kg
                'payload_capacity': {
                    'LEO': 22800,
                    'GTO': 8300,
                    'Mars': 4020
                },
                'stages': 2,
                'reusable': True,
                'thrust': 7607,  # kN
                'specific_impulse': 282  # seconds
            },
            'Atlas V': {
                'name': 'Atlas V',
                'manufacturer': 'ULA',
                'height': 58.3,
                'diameter': 3.8,
                'mass': 334500,
                'payload_capacity': {
                    'LEO': 18850,
                    'GTO': 8900
                },
                'stages': 2,
                'reusable': False,
                'thrust': 3827,
                'specific_impulse': 311
            },
            'Ariane 5': {
                'name': 'Ariane 5',
                'manufacturer': 'Arianespace',
                'height': 52,
                'diameter': 5.4,
                'mass': 777000,
                'payload_capacity': {
                    'LEO': 21000,
                    'GTO': 10500
                },
                'stages': 2,
                'reusable': False,
                'thrust': 13350,
                'specific_impulse': 278
            }
        }
        
        return rockets.get(rocket_name)
    
    def _calculate_target_orbit(self, orbit_type: str, rocket_specs: Dict) -> Dict:
        """Calculate target orbital parameters"""
        orbit_configs = {
            'LEO': {
                'altitude': random.uniform(400, 800),
                'inclination': random.uniform(28.5, 98.0),
                'eccentricity': random.uniform(0.0001, 0.01)
            },
            'MEO': {
                'altitude': random.uniform(2000, 35000),
                'inclination': random.uniform(0, 90),
                'eccentricity': random.uniform(0.001, 0.1)
            },
            'GEO': {
                'altitude': 35786,
                'inclination': random.uniform(0, 5),
                'eccentricity': random.uniform(0.0001, 0.01)
            },
            'SSO': {  # Sun-Synchronous Orbit
                'altitude': random.uniform(600, 1000),
                'inclination': 98.0,
                'eccentricity': random.uniform(0.0001, 0.01)
            }
        }
        
        config = orbit_configs.get(orbit_type, orbit_configs['LEO'])
        
        # Calculate derived parameters
        semi_major_axis = self.earth_radius + config['altitude']
        orbital_period = 2 * math.pi * math.sqrt(semi_major_axis**3 / self.mu) / 60  # minutes
        
        return {
            'type': orbit_type,
            'altitude': config['altitude'],
            'inclination': config['inclination'],
            'eccentricity': config['eccentricity'],
            'semi_major_axis': semi_major_axis,
            'orbital_period': orbital_period,
            'apogee': semi_major_axis * (1 + config['eccentricity']) - self.earth_radius,
            'perigee': semi_major_axis * (1 - config['eccentricity']) - self.earth_radius
        }
    
    def _simulate_launch_trajectory(self, launch_site: str, target_orbit: Dict) -> Dict:
        """Simulate launch trajectory phases"""
        
        launch_sites = {
            'Kennedy Space Center': {'lat': 28.5721, 'lng': -80.6480},
            'Vandenberg SFB': {'lat': 34.7420, 'lng': -120.5724},
            'Kourou': {'lat': 5.2389, 'lng': -52.7683},
            'Baikonur': {'lat': 45.9200, 'lng': 63.3420}
        }
        
        site_info = launch_sites.get(launch_site, launch_sites['Kennedy Space Center'])
        
        # Trajectory phases
        phases = [
            {
                'phase': 'Liftoff',
                'time': 0,
                'altitude': 0,
                'velocity': 0,
                'latitude': site_info['lat'],
                'longitude': site_info['lng']
            },
            {
                'phase': 'Max Q',
                'time': 80,
                'altitude': 12,
                'velocity': 0.5,
                'latitude': site_info['lat'] + 0.1,
                'longitude': site_info['lng'] + 0.1
            },
            {
                'phase': 'MECO',  # Main Engine Cutoff
                'time': 150,
                'altitude': 80,
                'velocity': 2.8,
                'latitude': site_info['lat'] + 0.5,
                'longitude': site_info['lng'] + 0.5
            },
            {
                'phase': 'Stage Separation',
                'time': 160,
                'altitude': 85,
                'velocity': 2.9,
                'latitude': site_info['lat'] + 0.6,
                'longitude': site_info['lng'] + 0.6
            },
            {
                'phase': 'Second Stage Ignition',
                'time': 170,
                'altitude': 90,
                'velocity': 3.0,
                'latitude': site_info['lat'] + 0.7,
                'longitude': site_info['lng'] + 0.7
            },
            {
                'phase': 'Orbital Insertion',
                'time': 540,
                'altitude': target_orbit['altitude'],
                'velocity': 7.8,  # Orbital velocity
                'latitude': site_info['lat'] + 2.0,
                'longitude': site_info['lng'] + 5.0
            }
        ]
        
        return {
            'launch_site': launch_site,
            'launch_coordinates': site_info,
            'phases': phases,
            'total_duration': 540,  # seconds
            'insertion_accuracy': random.uniform(0.95, 0.99)
        }
    
    def _analyze_launch_risks(self, trajectory: Dict, target_orbit: Dict) -> Dict:
        """Analyze collision risks during launch"""
        
        # Simulate risk analysis for each trajectory phase
        phase_risks = []
        for phase in trajectory['phases']:
            risk_level = 'low'
            risk_factors = []
            
            # Altitude-based risk assessment
            if phase['altitude'] < 100:
                risk_factors.append('Dense atmosphere - limited debris risk')
            elif 200 <= phase['altitude'] <= 1000:
                risk_level = 'medium'
                risk_factors.append('LEO debris field intersection')
            elif phase['altitude'] > 1000:
                risk_factors.append('Sparse debris environment')
            
            phase_risks.append({
                'phase': phase['phase'],
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'debris_encounters': random.randint(0, 3) if risk_level == 'medium' else 0
            })
        
        # Overall mission risk assessment
        overall_risk = 'low'
        if any(phase['risk_level'] == 'medium' for phase in phase_risks):
            overall_risk = 'medium'
        
        return {
            'overall_risk': overall_risk,
            'phase_risks': phase_risks,
            'critical_windows': self._identify_critical_windows(phase_risks),
            'mitigation_strategies': self._suggest_mitigation_strategies(overall_risk)
        }
    
    def _generate_mission_timeline(self, trajectory: Dict, target_orbit: Dict) -> List[Dict]:
        """Generate detailed mission timeline"""
        timeline = []
        
        # Pre-launch
        timeline.append({
            'time': -3600,  # T-1 hour
            'event': 'Final Go/No-Go Decision',
            'description': 'Mission control confirms launch readiness',
            'status': 'scheduled'
        })
        
        # Launch sequence
        for phase in trajectory['phases']:
            timeline.append({
                'time': phase['time'],
                'event': phase['phase'],
                'description': f"Altitude: {phase['altitude']} km, Velocity: {phase['velocity']} km/s",
                'status': 'scheduled'
            })
        
        # Post-insertion
        timeline.extend([
            {
                'time': 600,
                'event': 'Payload Deployment',
                'description': 'Satellite separation from upper stage',
                'status': 'scheduled'
            },
            {
                'time': 1800,
                'event': 'Initial Contact',
                'description': 'First communication with deployed satellite',
                'status': 'scheduled'
            },
            {
                'time': 7200,
                'event': 'Orbit Verification',
                'description': 'Confirm orbital parameters match target',
                'status': 'scheduled'
            }
        ])
        
        return timeline
    
    def _calculate_success_probability(self, collision_analysis: Dict) -> float:
        """Calculate mission success probability"""
        base_probability = 0.95
        
        # Reduce probability based on risks
        if collision_analysis['overall_risk'] == 'high':
            base_probability -= 0.1
        elif collision_analysis['overall_risk'] == 'medium':
            base_probability -= 0.05
        
        # Factor in critical windows
        critical_count = len(collision_analysis.get('critical_windows', []))
        base_probability -= critical_count * 0.02
        
        return max(0.7, base_probability)  # Minimum 70% probability
    
    def _generate_recommendations(self, collision_analysis: Dict) -> List[str]:
        """Generate mission recommendations"""
        recommendations = []
        
        if collision_analysis['overall_risk'] == 'high':
            recommendations.extend([
                'Consider delaying launch for optimal debris avoidance window',
                'Implement real-time trajectory adjustment capability',
                'Increase tracking radar coverage during ascent'
            ])
        elif collision_analysis['overall_risk'] == 'medium':
            recommendations.extend([
                'Monitor debris tracking updates until launch',
                'Prepare contingency abort procedures',
                'Coordinate with space surveillance network'
            ])
        
        recommendations.extend([
            'Verify payload deployment timing for debris avoidance',
            'Plan post-mission disposal orbit',
            'Implement collision avoidance maneuver capability'
        ])
        
        return recommendations
    
    def _get_mock_orbital_data(self, object_id: str) -> Dict:
        """Generate mock orbital data for object"""
        return {
            'id': object_id,
            'name': f'OBJECT-{object_id}',
            'altitude': random.uniform(400, 1500),
            'inclination': random.uniform(0, 180),
            'eccentricity': random.uniform(0.001, 0.1),
            'longitude': random.uniform(-180, 180),
            'latitude': random.uniform(-90, 90),
            'velocity': random.uniform(7.0, 8.0),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def _calculate_closest_approach(self, obj1: Dict, obj2: Dict) -> Dict:
        """Calculate closest approach between two objects"""
        # Simplified calculation for demonstration
        time_to_approach = random.uniform(1, 72)  # hours
        approach_time = datetime.utcnow() + timedelta(hours=time_to_approach)
        
        # Mock distance calculation
        distance = random.uniform(0.1, 10.0)  # km
        relative_velocity = random.uniform(5.0, 15.0)  # km/s
        
        return {
            'time': approach_time.isoformat(),
            'distance': distance,
            'relative_velocity': relative_velocity,
            'altitude': (obj1['altitude'] + obj2['altitude']) / 2,
            'latitude': random.uniform(-90, 90),
            'longitude': random.uniform(-180, 180)
        }
    
    def _calculate_collision_probability(self, closest_approach: Dict) -> float:
        """Calculate collision probability based on closest approach"""
        distance = closest_approach['distance']
        
        # Simplified probability model
        if distance < 0.5:
            return random.uniform(0.1, 0.5)
        elif distance < 1.0:
            return random.uniform(0.01, 0.1)
        elif distance < 2.0:
            return random.uniform(0.001, 0.01)
        else:
            return random.uniform(0.0001, 0.001)
    
    def _assess_risk_level(self, probability: float, distance: float) -> str:
        """Assess risk level based on probability and distance"""
        if probability > 0.1 or distance < 0.5:
            return 'critical'
        elif probability > 0.01 or distance < 1.0:
            return 'high'
        elif probability > 0.001 or distance < 2.0:
            return 'medium'
        else:
            return 'low'
    
    def _generate_avoidance_maneuvers(self, obj1: Dict, obj2: Dict, closest_approach: Dict) -> List[Dict]:
        """Generate collision avoidance maneuver options"""
        maneuvers = []
        
        # Option 1: Altitude adjustment
        maneuvers.append({
            'type': 'altitude_adjustment',
            'description': 'Raise orbit by 2 km to avoid conjunction',
            'delta_v': 1.2,  # m/s
            'fuel_cost': 0.5,  # kg
            'execution_time': (datetime.utcnow() + timedelta(hours=2)).isoformat(),
            'success_probability': 0.95
        })
        
        # Option 2: Phase adjustment
        maneuvers.append({
            'type': 'phase_adjustment',
            'description': 'Adjust orbital phase to delay encounter',
            'delta_v': 0.8,
            'fuel_cost': 0.3,
            'execution_time': (datetime.utcnow() + timedelta(hours=4)).isoformat(),
            'success_probability': 0.90
        })
        
        return maneuvers
    
    def _generate_monitoring_recommendations(self, collision_prob: float) -> List[str]:
        """Generate monitoring recommendations"""
        recommendations = []
        
        if collision_prob > 0.01:
            recommendations.extend([
                'Increase tracking frequency to every 30 minutes',
                'Coordinate with international space surveillance network',
                'Prepare emergency collision avoidance maneuvers'
            ])
        elif collision_prob > 0.001:
            recommendations.extend([
                'Monitor conjunction every 2 hours',
                'Update orbital predictions with latest tracking data',
                'Assess maneuver options if probability increases'
            ])
        else:
            recommendations.append('Continue routine monitoring')
        
        return recommendations
    
    def _evolve_debris_orbit(self, debris: Dict, days: int) -> Dict:
        """Simulate debris orbital evolution over time"""
        # Simple orbital decay model
        altitude_decay = days * random.uniform(0.1, 0.5)  # km per day
        new_altitude = max(200, debris['altitude'] - altitude_decay)
        
        # Update position (simplified)
        orbital_period = debris.get('orbital_period', 90)
        orbits_completed = (days * 24 * 60) / orbital_period
        longitude_change = (orbits_completed % 1) * 360
        
        evolved_debris = debris.copy()
        evolved_debris.update({
            'altitude': new_altitude,
            'longitude': (debris.get('longitude', 0) + longitude_change) % 360 - 180,
            'decay_rate': altitude_decay / days if days > 0 else 0
        })
        
        return evolved_debris
    
    def _calculate_density_hotspots(self, debris_list: List[Dict]) -> List[Dict]:
        """Calculate debris density hotspots"""
        # Grid-based density calculation
        hotspots = []
        
        # Define altitude bands
        altitude_bands = [(200, 600), (600, 1000), (1000, 1500), (1500, 2000)]
        
        for alt_min, alt_max in altitude_bands:
            band_debris = [d for d in debris_list if alt_min <= d['altitude'] <= alt_max]
            if len(band_debris) > 5:  # Threshold for hotspot
                hotspots.append({
                    'altitude_range': [alt_min, alt_max],
                    'debris_count': len(band_debris),
                    'density': len(band_debris) / (alt_max - alt_min),
                    'risk_level': 'high' if len(band_debris) > 20 else 'medium'
                })
        
        return hotspots
    
    def _identify_risk_zones(self, debris_list: List[Dict]) -> List[Dict]:
        """Identify high-risk orbital zones"""
        risk_zones = []
        
        # Analyze by inclination bands
        inclination_bands = [(0, 30), (30, 60), (60, 90), (90, 120), (120, 180)]
        
        for inc_min, inc_max in inclination_bands:
            band_debris = [d for d in debris_list if inc_min <= d.get('inclination', 0) <= inc_max]
            if len(band_debris) > 10:
                risk_zones.append({
                    'type': 'inclination_band',
                    'range': [inc_min, inc_max],
                    'debris_count': len(band_debris),
                    'risk_score': min(len(band_debris) / 50.0, 1.0)
                })
        
        return risk_zones
    
    def _calculate_field_collision_probability(self, debris_list: List[Dict]) -> float:
        """Calculate overall collision probability for debris field"""
        # Simplified model based on debris density
        total_debris = len(debris_list)
        high_risk_debris = len([d for d in debris_list if d.get('risk_level') == 'high'])
        
        base_probability = total_debris * 0.0001  # Base risk per object
        high_risk_multiplier = high_risk_debris * 0.001
        
        return min(base_probability + high_risk_multiplier, 0.1)  # Cap at 10%
    
    def _generate_evolution_summary(self, predictions: List[Dict]) -> Dict:
        """Generate summary of debris evolution predictions"""
        initial_count = predictions[0]['debris_count'] if predictions else 0
        final_count = predictions[-1]['debris_count'] if predictions else 0
        
        max_risk_day = max(predictions, key=lambda p: p['collision_probability'])['day'] if predictions else 0
        
        return {
            'initial_debris_count': initial_count,
            'final_debris_count': final_count,
            'net_change': final_count - initial_count,
            'peak_risk_day': max_risk_day,
            'trend': 'increasing' if final_count > initial_count else 'decreasing'
        }
    
    def _generate_debris_recommendations(self, predictions: List[Dict]) -> List[str]:
        """Generate recommendations for debris field management"""
        recommendations = [
            'Implement active debris removal for high-risk objects',
            'Coordinate international debris tracking efforts',
            'Develop improved collision prediction models',
            'Establish debris mitigation guidelines for new missions'
        ]
        
        # Add specific recommendations based on predictions
        if any(p['collision_probability'] > 0.05 for p in predictions):
            recommendations.insert(0, 'URGENT: Implement immediate collision avoidance protocols')
        
        return recommendations
    
    def _identify_critical_windows(self, phase_risks: List[Dict]) -> List[Dict]:
        """Identify critical risk windows during mission"""
        critical_windows = []
        
        for phase in phase_risks:
            if phase['risk_level'] in ['high', 'critical']:
                critical_windows.append({
                    'phase': phase['phase'],
                    'risk_level': phase['risk_level'],
                    'duration': '2-5 minutes',  # Typical phase duration
                    'mitigation': 'Real-time tracking and abort capability'
                })
        
        return critical_windows
    
    def _suggest_mitigation_strategies(self, risk_level: str) -> List[str]:
        """Suggest risk mitigation strategies"""
        strategies = {
            'low': [
                'Standard debris tracking protocols',
                'Routine mission monitoring'
            ],
            'medium': [
                'Enhanced tracking during critical phases',
                'Prepare abort procedures',
                'Coordinate with space surveillance network'
            ],
            'high': [
                'Real-time debris tracking',
                'Automated abort systems',
                'Alternative launch windows',
                'Trajectory optimization for debris avoidance'
            ]
        }
        
        return strategies.get(risk_level, strategies['low'])
    
    def _classify_payload(self, payload_name: str) -> str:
        """Classify payload type"""
        payload_lower = payload_name.lower()
        
        if any(keyword in payload_lower for keyword in ['satellite', 'sat']):
            return 'satellite'
        elif any(keyword in payload_lower for keyword in ['telescope', 'observatory']):
            return 'scientific'
        elif any(keyword in payload_lower for keyword in ['communication', 'comm']):
            return 'communication'
        elif any(keyword in payload_lower for keyword in ['weather', 'climate']):
            return 'earth_observation'
        elif any(keyword in payload_lower for keyword in ['navigation', 'gps']):
            return 'navigation'
        else:
            return 'general'
    
    def _get_launch_site_info(self, launch_site: str) -> Dict:
        """Get launch site information"""
        sites = {
            'Kennedy Space Center': {
                'name': 'Kennedy Space Center',
                'location': 'Florida, USA',
                'latitude': 28.5721,
                'longitude': -80.6480,
                'operator': 'NASA',
                'optimal_orbits': ['LEO', 'GTO', 'Interplanetary']
            },
            'Vandenberg SFB': {
                'name': 'Vandenberg Space Force Base',
                'location': 'California, USA',
                'latitude': 34.7420,
                'longitude': -120.5724,
                'operator': 'US Space Force',
                'optimal_orbits': ['SSO', 'Polar']
            },
            'Kourou': {
                'name': 'Guiana Space Centre',
                'location': 'French Guiana',
                'latitude': 5.2389,
                'longitude': -52.7683,
                'operator': 'Arianespace',
                'optimal_orbits': ['GTO', 'LEO']
            }
        }
        
        return sites.get(launch_site, sites['Kennedy Space Center'])