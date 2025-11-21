from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from db import get_db_connection, init_db
from psycopg2.extras import RealDictCursor
from auth import auth_bp
from routes.colleges import colleges_bp
from routes.programs import programs_bp
from routes.students import students_bp
from routes.statistics import statistics_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')

CORS(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(colleges_bp, url_prefix='/api/colleges')
app.register_blueprint(programs_bp, url_prefix='/api/programs')
app.register_blueprint(students_bp, url_prefix='/api/students')
app.register_blueprint(statistics_bp, url_prefix='/api/statistics')

# Create tables
with app.app_context():
    init_db()
    
    # Create default admin user if none exists
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM users WHERE username = %s", ('admin',))
    admin = cursor.fetchone()
    
    if not admin:
        password_hash = generate_password_hash('admin123')
        cursor.execute("""
            INSERT INTO users (username, email, full_name, role, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """, ('admin', 'admin@example.com', 'System Administrator', 'admin', password_hash))
        conn.commit()
        print("✓ Default admin user created (username: admin, password: admin123)")
    
    cursor.close()
    conn.close()
    
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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)