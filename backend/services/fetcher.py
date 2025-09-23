import requests
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import random
import math

class DataFetcher:
    """Service for fetching and managing space debris data"""
    
    def __init__(self):
        self.cache_file = 'data/cache.json'
        self.sample_data_file = 'data/sample_data.json'
        self.celestrak_urls = {
            'stations': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle',
            'visual': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle',
            'active': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
            'debris': 'https://celestrak.org/NORAD/elements/gp.php?GROUP=1999-025&FORMAT=tle'
        }
        self.last_update = None
        self.cache_duration = timedelta(hours=6)  # Refresh every 6 hours
    
    def initialize_sample_data(self):
        """Initialize with sample space debris data for demo purposes"""
        sample_data = {
            'satellites': self._generate_sample_satellites(),
            'debris': self._generate_sample_debris(),
            'rockets': self._generate_sample_rockets(),
            'alerts': self._generate_sample_alerts(),
            'stats': {},
            'last_updated': datetime.utcnow().isoformat()
        }
        
        # Calculate stats
        sample_data['stats'] = self._calculate_stats(sample_data)
        
        # Save to cache
        os.makedirs('data', exist_ok=True)
        with open(self.cache_file, 'w') as f:
            json.dump(sample_data, f, indent=2)
        
        with open(self.sample_data_file, 'w') as f:
            json.dump(sample_data, f, indent=2)
        
        print(f"✅ Initialized sample data with {len(sample_data['satellites'])} satellites and {len(sample_data['debris'])} debris objects")
    
    def get_dashboard_stats(self) -> Dict:
        """Get dashboard statistics"""
        data = self._load_cached_data()
        
        total_objects = len(data.get('satellites', [])) + len(data.get('debris', []))
        active_satellites = len([s for s in data.get('satellites', []) if s.get('status') == 'active'])
        debris_count = len(data.get('debris', []))
        high_risk_collisions = len([a for a in data.get('alerts', []) if a.get('severity') in ['high', 'critical']])
        
        return {
            'total_tracked_objects': total_objects,
            'active_satellites': active_satellites,
            'debris_objects': debris_count,
            'high_risk_collisions': high_risk_collisions,
            'last_update': data.get('last_updated', datetime.utcnow().isoformat()),
            'system_status': 'online',
            'data_sources': ['CelesTrak', 'Space-Track.org', 'Sample Data']
        }
    
    def get_debris_data(self, object_type='all', altitude_range=None, risk_level='all', limit=100) -> List[Dict]:
        """Get filtered debris data"""
        data = self._load_cached_data()
        all_objects = data.get('satellites', []) + data.get('debris', [])
        
        # Apply filters
        filtered_objects = []
        for obj in all_objects:
            # Type filter
            if object_type != 'all' and obj.get('object_type') != object_type:
                continue
            
            # Altitude filter
            if altitude_range and altitude_range[0] is not None and altitude_range[1] is not None:
                alt = obj.get('altitude', 0)
                if not (altitude_range[0] <= alt <= altitude_range[1]):
                    continue
            
            # Risk filter
            if risk_level != 'all' and obj.get('risk_level') != risk_level:
                continue
            
            filtered_objects.append(obj)
        
        # Sort by risk level and altitude
        risk_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        filtered_objects.sort(key=lambda x: (risk_order.get(x.get('risk_level', 'low'), 1), -x.get('altitude', 0)), reverse=True)
        
        return filtered_objects[:limit]
    
    def get_satellites(self) -> List[Dict]:
        """Get satellite data"""
        data = self._load_cached_data()
        return data.get('satellites', [])
    
    def get_rockets(self, orbit_type='all') -> List[Dict]:
        """Get rocket data"""
        data = self._load_cached_data()
        rockets = data.get('rockets', [])
        
        if orbit_type != 'all':
            rockets = [r for r in rockets if r.get('target_orbit', '').lower() == orbit_type.lower()]
        
        return rockets
    
    def get_heatmap_data(self) -> List[Dict]:
        """Generate heatmap data for debris density"""
        data = self._load_cached_data()
        all_objects = data.get('satellites', []) + data.get('debris', [])
        
        # Create grid for heatmap (simplified)
        heatmap_points = []
        
        # Generate density points based on orbital inclination and altitude
        for lat in range(-90, 91, 10):
            for lng in range(-180, 181, 10):
                # Count objects that might pass over this region
                density = 0
                for obj in all_objects:
                    inclination = obj.get('inclination', 0)
                    altitude = obj.get('altitude', 0)
                    
                    # Simple density calculation based on orbital mechanics
                    if abs(lat) <= inclination and altitude > 200:
                        density += 1
                
                if density > 0:
                    heatmap_points.append({
                        'lat': lat,
                        'lng': lng,
                        'density': density,
                        'intensity': min(density / 10.0, 1.0)
                    })
        
        return heatmap_points
    
    def get_timeline_data(self, start_time=None, end_time=None) -> Dict:
        """Get timeline data for playback"""
        if not start_time:
            start_time = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        if not end_time:
            end_time = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        
        data = self._load_cached_data()
        all_objects = data.get('satellites', []) + data.get('debris', [])
        
        # Generate timeline snapshots (simplified)
        timeline = []
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        # Create hourly snapshots
        current_time = start_dt
        while current_time <= end_dt:
            snapshot = {
                'timestamp': current_time.isoformat(),
                'objects': []
            }
            
            for obj in all_objects[:100]:  # Limit for performance
                # Simulate orbital position (simplified)
                orbital_period = obj.get('orbital_period', 90)  # minutes
                time_diff = (current_time - start_dt).total_seconds() / 60  # minutes
                orbital_phase = (time_diff / orbital_period) % 1
                
                # Calculate approximate position
                inclination = math.radians(obj.get('inclination', 0))
                longitude = (orbital_phase * 360 - 180) % 360 - 180
                latitude = math.sin(orbital_phase * 2 * math.pi) * math.degrees(inclination)
                
                snapshot['objects'].append({
                    'id': obj.get('id'),
                    'name': obj.get('name'),
                    'lat': latitude,
                    'lng': longitude,
                    'altitude': obj.get('altitude'),
                    'type': obj.get('object_type'),
                    'risk': obj.get('risk_level')
                })
            
            timeline.append(snapshot)
            current_time += timedelta(hours=1)
        
        return {
            'timeline': timeline,
            'start_time': start_time,
            'end_time': end_time,
            'total_snapshots': len(timeline)
        }
    
    def _load_cached_data(self) -> Dict:
        """Load data from cache or fetch new data"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    data = json.load(f)
                
                # Check if cache is still valid
                last_updated = datetime.fromisoformat(data.get('last_updated', '2000-01-01T00:00:00'))
                if datetime.utcnow() - last_updated < self.cache_duration:
                    return data
            except Exception as e:
                print(f"Error loading cache: {e}")
        
        # Fetch new data or use sample data
        return self._fetch_fresh_data()
    
    def _fetch_fresh_data(self) -> Dict:
        """Fetch fresh data from external sources or use sample data"""
        try:
            # Try to fetch from CelesTrak (simplified for demo)
            print("🌐 Attempting to fetch fresh data from CelesTrak...")
            
            # For demo purposes, we'll use sample data
            # In production, implement actual API calls to CelesTrak/Space-Track
            if os.path.exists(self.sample_data_file):
                with open(self.sample_data_file, 'r') as f:
                    return json.load(f)
            else:
                # Generate new sample data
                self.initialize_sample_data()
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
        
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            # Return minimal data structure
            return {
                'satellites': [],
                'debris': [],
                'rockets': [],
                'alerts': [],
                'stats': {},
                'last_updated': datetime.utcnow().isoformat()
            }
    
    def _generate_sample_satellites(self) -> List[Dict]:
        """Generate sample satellite data"""
        satellites = []
        satellite_names = [
            "ISS (ZARYA)", "HUBBLE SPACE TELESCOPE", "TERRA", "AQUA", "LANDSAT 8",
            "SENTINEL-1A", "SENTINEL-2A", "NOAA-20", "GOES-16", "GPS BIIR-2",
            "IRIDIUM 33", "COSMOS 2251", "STARLINK-1007", "STARLINK-1019", "STARLINK-1130",
            "ONEWEB-0001", "ONEWEB-0002", "PLANET-1", "PLANET-2", "SKYSAT-1"
        ]
        
        for i, name in enumerate(satellite_names):
            # Generate realistic orbital parameters
            if "ISS" in name:
                altitude = random.uniform(400, 420)
                inclination = 51.6
            elif "STARLINK" in name:
                altitude = random.uniform(540, 570)
                inclination = 53.0
            elif "GPS" in name:
                altitude = random.uniform(20180, 20200)
                inclination = 55.0
            elif "GOES" in name:
                altitude = random.uniform(35780, 35790)
                inclination = random.uniform(0, 5)
            else:
                altitude = random.uniform(300, 1500)
                inclination = random.uniform(0, 180)
            
            satellites.append({
                'id': 25544 + i,
                'name': name,
                'catalog_number': 25544 + i,
                'operator': self._get_operator(name),
                'launch_date': self._random_date(2000, 2024),
                'altitude': altitude,
                'inclination': inclination,
                'eccentricity': random.uniform(0.0001, 0.01),
                'orbital_period': self._calculate_period(altitude),
                'object_type': 'satellite',
                'status': random.choice(['active', 'active', 'active', 'inactive']),
                'risk_level': random.choice(['low', 'low', 'medium', 'high']),
                'last_updated': datetime.utcnow().isoformat(),
                'latitude': random.uniform(-90, 90),
                'longitude': random.uniform(-180, 180)
            })
        
        return satellites
    
    def _generate_sample_debris(self) -> List[Dict]:
        """Generate sample debris data"""
        debris = []
        debris_sources = [
            "FENGYUN 1C DEB", "COSMOS 2251 DEB", "IRIDIUM 33 DEB", "CERISE DEB",
            "ROCKET BODY", "ATLAS CENTAUR R/B", "FALCON 9 R/B", "ARIANE 5 R/B"
        ]
        
        for i in range(50):
            source = random.choice(debris_sources)
            name = f"{source} #{i+1:03d}"
            
            # Debris typically in LEO with higher risk
            altitude = random.uniform(200, 2000)
            inclination = random.uniform(0, 180)
            
            debris.append({
                'id': 40000 + i,
                'name': name,
                'catalog_number': 40000 + i,
                'source_object': source.split(' DEB')[0] if 'DEB' in source else source,
                'creation_date': self._random_date(2007, 2024),
                'altitude': altitude,
                'inclination': inclination,
                'eccentricity': random.uniform(0.001, 0.1),
                'orbital_period': self._calculate_period(altitude),
                'object_type': 'debris' if 'DEB' in source else 'rocket_body',
                'status': 'debris',
                'risk_level': random.choice(['medium', 'high', 'high', 'critical']),
                'size_estimate': random.choice(['small', 'medium', 'large']),
                'last_updated': datetime.utcnow().isoformat(),
                'latitude': random.uniform(-90, 90),
                'longitude': random.uniform(-180, 180)
            })
        
        return debris
    
    def _generate_sample_rockets(self) -> List[Dict]:
        """Generate sample rocket data"""
        rockets = [
            {
                'id': 'falcon9',
                'name': 'Falcon 9',
                'manufacturer': 'SpaceX',
                'payload_capacity': {'LEO': 22800, 'GTO': 8300},
                'max_altitude': 1200,
                'target_orbit': 'LEO',
                'launch_sites': ['Kennedy Space Center', 'Vandenberg SFB'],
                'risk_assessment': 'low',
                'reusable': True,
                'active': True
            },
            {
                'id': 'atlas5',
                'name': 'Atlas V',
                'manufacturer': 'ULA',
                'payload_capacity': {'LEO': 18850, 'GTO': 8900},
                'max_altitude': 35786,
                'target_orbit': 'GTO',
                'launch_sites': ['Cape Canaveral'],
                'risk_assessment': 'low',
                'reusable': False,
                'active': True
            },
            {
                'id': 'ariane5',
                'name': 'Ariane 5',
                'manufacturer': 'Arianespace',
                'payload_capacity': {'LEO': 21000, 'GTO': 10500},
                'max_altitude': 35786,
                'target_orbit': 'GTO',
                'launch_sites': ['Kourou'],
                'risk_assessment': 'medium',
                'reusable': False,
                'active': True
            }
        ]
        
        return rockets
    
    def _generate_sample_alerts(self) -> List[Dict]:
        """Generate sample collision alerts"""
        alerts = []
        
        for i in range(10):
            severity = random.choice(['low', 'medium', 'high', 'critical'])
            
            alerts.append({
                'id': f'alert_{i+1:03d}',
                'timestamp': (datetime.utcnow() - timedelta(hours=random.randint(0, 48))).isoformat(),
                'severity': severity,
                'object1': f'SATELLITE-{random.randint(1000, 9999)}',
                'object2': f'DEBRIS-{random.randint(1000, 9999)}',
                'closest_approach': (datetime.utcnow() + timedelta(hours=random.randint(1, 72))).isoformat(),
                'miss_distance': random.uniform(0.1, 10.0),  # km
                'probability': random.uniform(0.001, 0.1),
                'altitude': random.uniform(400, 1500),
                'status': random.choice(['active', 'monitoring', 'resolved']),
                'description': f'{severity.title()} risk collision alert between active satellite and debris object'
            })
        
        return alerts
    
    def _calculate_stats(self, data: Dict) -> Dict:
        """Calculate summary statistics"""
        satellites = data.get('satellites', [])
        debris = data.get('debris', [])
        alerts = data.get('alerts', [])
        
        return {
            'total_objects': len(satellites) + len(debris),
            'active_satellites': len([s for s in satellites if s.get('status') == 'active']),
            'debris_count': len(debris),
            'high_risk_alerts': len([a for a in alerts if a.get('severity') in ['high', 'critical']]),
            'orbit_distribution': self._calculate_orbit_distribution(satellites + debris),
            'risk_distribution': self._calculate_risk_distribution(satellites + debris)
        }
    
    def _calculate_orbit_distribution(self, objects: List[Dict]) -> Dict:
        """Calculate orbit type distribution"""
        distribution = {'LEO': 0, 'MEO': 0, 'GEO': 0, 'HEO': 0}
        
        for obj in objects:
            alt = obj.get('altitude', 0)
            if alt < 2000:
                distribution['LEO'] += 1
            elif alt < 35000:
                distribution['MEO'] += 1
            elif 35000 <= alt <= 36000:
                distribution['GEO'] += 1
            else:
                distribution['HEO'] += 1
        
        return distribution
    
    def _calculate_risk_distribution(self, objects: List[Dict]) -> Dict:
        """Calculate risk level distribution"""
        distribution = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        
        for obj in objects:
            risk = obj.get('risk_level', 'low')
            distribution[risk] += 1
        
        return distribution
    
    def _get_operator(self, name: str) -> str:
        """Get satellite operator based on name"""
        if 'ISS' in name:
            return 'International'
        elif 'STARLINK' in name:
            return 'SpaceX'
        elif 'ONEWEB' in name:
            return 'OneWeb'
        elif 'GPS' in name:
            return 'US Space Force'
        elif 'GOES' in name:
            return 'NOAA'
        elif 'SENTINEL' in name:
            return 'ESA'
        elif 'LANDSAT' in name:
            return 'NASA/USGS'
        else:
            return random.choice(['NASA', 'ESA', 'JAXA', 'ISRO', 'SpaceX', 'Commercial'])
    
    def _random_date(self, start_year: int, end_year: int) -> str:
        """Generate random date string"""
        year = random.randint(start_year, end_year)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        return f"{year}-{month:02d}-{day:02d}"
    
    def _calculate_period(self, altitude: float) -> float:
        """Calculate orbital period in minutes"""
        earth_radius = 6371.0  # km
        mu = 398600.4418  # Earth's gravitational parameter
        
        a = earth_radius + altitude  # semi-major axis
        period_seconds = 2 * math.pi * math.sqrt(a**3 / mu)
        return period_seconds / 60  # convert to minutes