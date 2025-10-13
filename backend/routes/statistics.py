from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Student, Program, College

statistics_bp = Blueprint('statistics', __name__)

@statistics_bp.route('', methods=['GET'])
@jwt_required()
def get_statistics():
    return jsonify({
        'total_students': Student.query.count(),
        'total_programs': Program.query.count(),
        'total_colleges': College.query.count()
    })
