from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import json
import os
from datetime import datetime, timedelta
import requests
from services.fetcher import DataFetcher
from services.predictor import CollisionPredictor
from services.report_gen import ReportGenerator
from tle_parser import TLEParser

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'orbitops-secret-key-2024'  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

jwt = JWTManager(app)
CORS(app)

# Initialize services
data_fetcher = DataFetcher()
collision_predictor = CollisionPredictor()
report_generator = ReportGenerator()
tle_parser = TLEParser()

# Mock user database
USERS = {
    'admin@orbitops.com': {'password': 'admin123', 'role': 'admin'},
    'viewer@orbitops.com': {'password': 'viewer123', 'role': 'viewer'},
    'demo@orbitops.com': {'password': 'demo123', 'role': 'admin'}
}

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User authentication endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if email in USERS and USERS[email]['password'] == password:
            access_token = create_access_token(
                identity=email,
                additional_claims={'role': USERS[email]['role']}
            )
            return jsonify({
                'success': True,
                'access_token': access_token,
                'user': {
                    'email': email,
                    'role': USERS[email]['role']
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint (mock)"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'viewer')
        
        if email in USERS:
            return jsonify({'success': False, 'message': 'User already exists'}), 400
        
        USERS[email] = {'password': password, 'role': role}
        access_token = create_access_token(
            identity=email,
            additional_claims={'role': role}
        )
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'user': {'email': email, 'role': role}
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        stats = data_fetcher.get_dashboard_stats()
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/debris', methods=['GET'])
def get_debris():
    """Get space debris data with filtering"""
    try:
        # Get query parameters
        object_type = request.args.get('type', 'all')
        altitude_min = request.args.get('altitude_min', type=int)
        altitude_max = request.args.get('altitude_max', type=int)
        risk_level = request.args.get('risk', 'all')
        limit = request.args.get('limit', 100, type=int)
        
        debris_data = data_fetcher.get_debris_data(
            object_type=object_type,
            altitude_range=(altitude_min, altitude_max),
            risk_level=risk_level,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'data': debris_data,
            'count': len(debris_data)
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/satellites', methods=['GET'])
def get_satellites():
    """Get satellite data"""
    try:
        satellites = data_fetcher.get_satellites()
        return jsonify({
            'success': True,
            'data': satellites
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/rockets', methods=['GET'])
def get_rockets():
    """Get rocket data"""
    try:
        orbit_type = request.args.get('orbit_type', 'all')
        rockets = data_fetcher.get_rockets(orbit_type=orbit_type)
        return jsonify({
            'success': True,
            'data': rockets
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get collision alerts"""
    try:
        severity = request.args.get('severity', 'all')
        alerts = collision_predictor.get_alerts(severity=severity)
        return jsonify({
            'success': True,
            'data': alerts
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/simulate', methods=['POST'])
@jwt_required()
def simulate_mission():
    """Simulate rocket launch and orbit"""
    try:
        data = request.get_json()
        rocket_name = data.get('rocket')
        payload = data.get('payload')
        orbit_type = data.get('orbit')
        launch_site = data.get('launch_site')
        
        simulation_result = collision_predictor.simulate_launch(
            rocket_name=rocket_name,
            payload=payload,
            orbit_type=orbit_type,
            launch_site=launch_site
        )
        
        return jsonify({
            'success': True,
            'data': simulation_result
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/report', methods=['POST'])
@jwt_required()
def generate_report():
    """Generate mission report"""
    try:
        data = request.get_json()
        report_type = data.get('type', 'mission')
        parameters = data.get('parameters', {})
        
        report_path = report_generator.generate_report(
            report_type=report_type,
            parameters=parameters
        )
        
        return send_file(report_path, as_attachment=True)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/upload-tle', methods=['POST'])
@jwt_required()
def upload_tle():
    """Upload custom TLE data"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Parse TLE file
        tle_content = file.read().decode('utf-8')
        parsed_data = tle_parser.parse_tle_string(tle_content)
        
        return jsonify({
            'success': True,
            'data': parsed_data,
            'message': f'Successfully parsed {len(parsed_data)} objects'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap_data():
    """Get debris density heatmap data"""
    try:
        heatmap_data = data_fetcher.get_heatmap_data()
        return jsonify({
            'success': True,
            'data': heatmap_data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/timeline', methods=['GET'])
def get_timeline_data():
    """Get timeline data for playback"""
    try:
        start_time = request.args.get('start')
        end_time = request.args.get('end')
        
        timeline_data = data_fetcher.get_timeline_data(start_time, end_time)
        return jsonify({
            'success': True,
            'data': timeline_data
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Initialize sample data if not exists
    if not os.path.exists('data/cache.json'):
        data_fetcher.initialize_sample_data()
    
    print("🚀 OrbitOPS Backend Starting...")
    print("📡 Space Debris Monitoring API Ready")
    print("🌌 Access at: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)