from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        data = request.json
        
        # Validation
        required_fields = ['username', 'email', 'password', 'full_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE username = %s", (data['username'],))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 400
        
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        
        cursor.execute("""
            INSERT INTO users (username, email, full_name, role, password_hash)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, username, email, full_name, role, created_at
        """, (
            data['username'].strip(),
            data['email'].strip().lower(),
            data['full_name'].strip(),
            data.get('role', 'user'),
            hashed_password
        ))
        
        new_user = cursor.fetchone()
        conn.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        data = request.json
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user
        cursor.execute("SELECT * FROM users WHERE username = %s", (data['username'],))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create access token
        access_token = create_access_token(
            identity=str(user['id']),
            expires_delta=timedelta(hours=24)
        )
        
        # Remove password hash from response
        user.pop('password_hash', None)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        user_id = get_jwt_identity()
        
        cursor.execute("SELECT id, username, email, full_name, role, created_at FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({'error': 'Old and new passwords are required'}), 400
        
        # Get current password hash
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], data['old_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        new_hash = generate_password_hash(data['new_password'])
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
        conn.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()