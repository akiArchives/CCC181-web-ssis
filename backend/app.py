from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, User
from auth import auth_bp
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from routes.statistics import statistics_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')

CORS(app)
db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(colleges_bp, url_prefix='/api/colleges')
app.register_blueprint(programs_bp, url_prefix='/api/programs')
app.register_blueprint(students_bp, url_prefix='/api/students')
app.register_blueprint(statistics_bp, url_prefix='/api/statistics')

# Create tables
with app.app_context():
    db.create_all()
    
    # Create default admin user if none exists
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@example.com',
            full_name='System Administrator',
            role='admin'
        )
        admin.set_password('admin123')  # Change this in production!
        db.session.add(admin)
        db.session.commit()
        print("✓ Default admin user created (username: admin, password: admin123)")
    
    print("✓ Database tables created successfully!")

# Add JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error):
    try:
        auth_hdr = request.headers.get('Authorization')
    except Exception:
        auth_hdr = None
    print('JWT invalid_token_loader called:', error, 'Authorization header:', auth_hdr)
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def unauthorized_callback(error):
    try:
        auth_hdr = request.headers.get('Authorization')
    except Exception:
        auth_hdr = None
    print('JWT unauthorized_loader called:', error, 'Authorization header:', auth_hdr)
    return jsonify({'error': 'Missing authorization token'}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    try:
        auth_hdr = request.headers.get('Authorization')
    except Exception:
        auth_hdr = None
    print('JWT expired_token_loader called. jwt_header:', jwt_header, 'jwt_data:', jwt_data, 'Authorization header:', auth_hdr)
    return jsonify({'error': 'Token has expired'}), 401

# ============== TEST ROUTE ==============

@app.route('/')
def home():
    return jsonify({
        'message': 'Student Information System API',
        'status': 'running',
        'endpoints': [
            '/api/auth/register',
            '/api/auth/login',
            '/api/auth/me',
            '/api/colleges',
            '/api/programs', 
            '/api/students',
            '/api/statistics'
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)