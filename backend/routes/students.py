from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from services.student_service import StudentService

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['GET'])
@jwt_required()
def get_students():
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'id')
    sort_order = request.args.get('sort_order', 'asc')
    
    pagination = StudentService.get_all_students(search, page, per_page, sort_by, sort_order)
    
    return jsonify({
        'data': [student.to_dict() for student in pagination.items],
        'meta': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages,
            'total_items': pagination.total
        }
    })

@students_bp.route('', methods=['POST'])
@jwt_required()
def create_student():
    data = request.json
    try:
        new_student = StudentService.create_student(data)
        return jsonify(new_student.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        # In a real app, you would log the error `e` here
        return jsonify({'error': 'An internal server error occurred'}), 500

@students_bp.route('/<id>', methods=['PUT'])
@jwt_required()
def update_student(id):
    student = StudentService.get_student_by_id(id.strip().upper())
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    data = request.json
    try:
        updated_student = StudentService.update_student(student, data)
        return jsonify(updated_student.to_dict())
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500

@students_bp.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_student(id):
    student = StudentService.get_student_by_id(id.strip().upper())
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    try:
        StudentService.delete_student(student)
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500

@students_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_students():
    ids = request.json.get('ids', [])
    try:
        num_deleted = StudentService.bulk_delete_students(ids)
        return jsonify({'message': f'{num_deleted} students deleted'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500
