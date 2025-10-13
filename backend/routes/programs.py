from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db
from services.program_service import ProgramService

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('', methods=['GET'])
@jwt_required()
def get_programs():
    search = request.args.get('search', '').strip()
    programs = ProgramService.get_all_programs(search)
    return jsonify([program.to_dict() for program in programs])

@programs_bp.route('', methods=['POST'])
@jwt_required()
def create_program():
    data = request.json
    try:
        new_program = ProgramService.create_program(data)
        return jsonify(new_program.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500

@programs_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_program(code):
    program = ProgramService.get_program_by_code(code.strip().upper())
    if not program:
        return jsonify({'error': 'Program not found'}), 404

    data = request.json
    try:
        updated_program = ProgramService.update_program(program, data)
        return jsonify(updated_program.to_dict())
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500

@programs_bp.route('/<code>', methods=['DELETE'])
@jwt_required()
def delete_program(code):
    program = ProgramService.get_program_by_code(code.strip().upper())
    if not program:
        return jsonify({'error': 'Program not found'}), 404

    try:
        ProgramService.delete_program(program)
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500

@programs_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_programs():
    codes = request.json.get('codes', [])
    try:
        num_deleted = ProgramService.bulk_delete_programs(codes)
        return jsonify({'message': f'{num_deleted} programs deleted'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An internal server error occurred'}), 500
