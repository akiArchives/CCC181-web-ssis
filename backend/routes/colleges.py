from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.college_service import CollegeService

colleges_bp = Blueprint('colleges', __name__)

@colleges_bp.route('', methods=['GET'])
@jwt_required()
def get_colleges():
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'code')
    sort_order = request.args.get('sort_order', 'asc')
    
    result = CollegeService.get_all_colleges(search, page, per_page, sort_by, sort_order)
    
    return jsonify({
        'data': result['items'],
        'meta': {
            'page': result['page'],
            'per_page': result['per_page'],
            'total_pages': result['pages'],
            'total_items': result['total']
        }
    })

@colleges_bp.route('', methods=['POST'])
@jwt_required()
def create_college():
    data = request.json
    try:
        new_college = CollegeService.create_college(data)
        return jsonify(new_college), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An internal server error occurred'}), 500

@colleges_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_college(code):
    college = CollegeService.get_college_by_code(code.strip().upper())
    if not college:
        return jsonify({'error': 'College not found'}), 404

    data = request.json
    try:
        updated_college = CollegeService.update_college(college, data)
        return jsonify(updated_college)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An internal server error occurred'}), 500

@colleges_bp.route('/<code>', methods=['DELETE'])
@jwt_required()
def delete_college(code):
    college = CollegeService.get_college_by_code(code.strip().upper())
    if not college:
        return jsonify({'error': 'College not found'}), 404

    try:
        CollegeService.delete_college(college)
        return jsonify({'message': 'College deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'An internal server error occurred'}), 500

@colleges_bp.route('/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_colleges():
    codes = request.json.get('codes', [])
    try:
        num_deleted = CollegeService.bulk_delete_colleges(codes)
        return jsonify({'message': f'{num_deleted} colleges deleted'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error updating college: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500
