from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from db import get_db_connection

statistics_bp = Blueprint('statistics', __name__)

@statistics_bp.route('', methods=['GET'])
@jwt_required()
def get_statistics():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM programs")
        total_programs = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM colleges")
        total_colleges = cursor.fetchone()[0]
        
        return jsonify({
            'total_students': total_students,
            'total_programs': total_programs,
            'total_colleges': total_colleges
        })
    finally:
        cursor.close()
        conn.close()
