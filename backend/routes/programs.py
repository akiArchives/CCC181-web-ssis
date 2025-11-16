from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.program_service import ProgramService

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('', methods=['GET'])
@jwt_required()
def get_programs():
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'code')
    sort_order = request.args.get('sort_order', 'asc')
    
    result = ProgramService.get_all_programs(search, page, per_page, sort_by, sort_order)
    
    return jsonify({
        'data': result['items'],
        'meta': {
            'page': result['page'],
            'per_page': result['per_page'],
            'total_pages': result['pages'],
            'total_items': result['total']
        }
    })

@programs_bp.route('', methods=['POST'])
@jwt_required()
def create_program():
    data = request.json
    try:
        new_program = ProgramService.create_program(data)
        return jsonify(new_program), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
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
        return jsonify(updated_program)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
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
        return jsonify({'error': 'An internal server error occurred'}), 500
