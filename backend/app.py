from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, College, Program, Student
from sqlalchemy import or_
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

CORS(app)
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
    print("✓ Database tables created successfully!")

# ============== COLLEGE ROUTES ==============

@app.route('/api/colleges', methods=['GET'])
def get_colleges():
    search = request.args.get('search', '').strip()
    query = College.query
    
    if search:
        query = query.filter(
            or_(
                College.code.ilike(f'%{search}%'),
                College.name.ilike(f'%{search}%')
            )
        )
    
    colleges = query.all()
    return jsonify([college.to_dict() for college in colleges])

@app.route('/api/colleges', methods=['POST'])
def create_college():
    try:
        data = request.json

        if not data.get('code') or not data.get('name'):
            return jsonify({'error': 'Code and name are required'}), 400

        code = data['code'].strip().upper()
        name = data['name'].strip()

        if College.query.get(code):
            return jsonify({'error': 'College code already exists'}), 400

        college = College(
            code=code,
            name=name
        )
        
        db.session.add(college)
        db.session.commit()
        
        return jsonify(college.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/colleges/<code>', methods=['PUT'])
def update_college(code):
    try:
        code = code.strip().upper()
        college = College.query.get_or_404(code)
        data = request.json
        
        new_code = data['code'].strip().upper()
        if new_code != code and College.query.get(new_code):
            return jsonify({'error': 'College code already exists'}), 400
        
        college.code = new_code
        college.name = data['name'].strip()
        
        db.session.commit()
        return jsonify(college.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/colleges/<code>', methods=['DELETE'])
def delete_college(code):
    try:
        code = code.strip().upper()
        college = College.query.get_or_404(code)
        db.session.delete(college)
        db.session.commit()
        return jsonify({'message': 'College deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/colleges/bulk-delete', methods=['POST'])
def bulk_delete_colleges():
    try:
        codes = request.json.get('codes', [])
        if not codes:
            return jsonify({'error': 'No codes provided'}), 400
        
        College.query.filter(College.code.in_(codes)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'message': f'{len(codes)} colleges deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============== PROGRAM ROUTES ==============

@app.route('/api/programs', methods=['GET'])
def get_programs():
    search = request.args.get('search', '').strip()
    query = Program.query
    
    if search:
        query = query.filter(
            or_(
                Program.code.ilike(f'%{search}%'),
                Program.name.ilike(f'%{search}%')
            )
        )
    
    programs = query.all()
    return jsonify([program.to_dict() for program in programs])

@app.route('/api/programs', methods=['POST'])
def create_program():
    try:
        data = request.json

        if not data.get('code') or not data.get('name') or not data.get('college_code'):
            return jsonify({'error': 'Code, name, and college are required'}), 400

        program_code = data['code'].strip().upper()
        name = data['name'].strip()
        college_code = data['college_code'].strip().upper()

        if Program.query.get(program_code):
            return jsonify({'error': 'Program code already exists'}), 400

        if not College.query.get(college_code):
            return jsonify({'error': 'College does not exist'}), 400

        program = Program(
            code=program_code,
            name=name,
            college_code=college_code
        )
        
        db.session.add(program)
        db.session.commit()
        
        return jsonify(program.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/programs/<code>', methods=['PUT'])
def update_program(code):
    try:
        code = code.strip().upper()
        program = Program.query.get_or_404(code)
        data = request.json
        
        new_code = data['code'].strip().upper()
        if new_code != code and Program.query.get(new_code):
            return jsonify({'error': 'Program code already exists'}), 400
        
        program.code = new_code
        program.name = data['name'].strip()
        program.college_code = data['college_code'].strip().upper()
        
        db.session.commit()
        return jsonify(program.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/programs/<code>', methods=['DELETE'])
def delete_program(code):
    try:
        code = code.strip().upper()
        program = Program.query.get_or_404(code)
        db.session.delete(program)
        db.session.commit()
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/programs/bulk-delete', methods=['POST'])
def bulk_delete_programs():
    try:
        codes = request.json.get('codes', [])
        if not codes:
            return jsonify({'error': 'No codes provided'}), 400
        
        Program.query.filter(Program.code.in_(codes)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'message': f'{len(codes)} programs deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============== STUDENT ROUTES ==============

@app.route('/api/students', methods=['GET'])
def get_students():
    search = request.args.get('search', '').strip()
    query = Student.query
    
    if search:
        query = query.filter(
            or_(
                Student.id.ilike(f'%{search}%'),
                Student.first_name.ilike(f'%{search}%'),
                Student.last_name.ilike(f'%{search}%')
            )
        )
    
    students = query.all()
    return jsonify([student.to_dict() for student in students])

@app.route('/api/students', methods=['POST'])
def create_student():
    try:
        data = request.json

        required = ['id', 'first_name', 'last_name', 'year_level', 'gender', 'program_code']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        student_id = data['id'].strip().upper()
        program_code = data['program_code'].strip().upper()

        if Student.query.get(student_id):
            return jsonify({'error': 'Student ID already exists'}), 400

        if not Program.query.get(program_code):
            return jsonify({'error': 'Program does not exist'}), 400

        student = Student(
            id=student_id,
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            year_level=int(data['year_level']),
            gender=data['gender'],
            program_code=program_code
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify(student.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<id>', methods=['PUT'])
def update_student(id):
    try:
        id = id.strip().upper()
        student = Student.query.get_or_404(id)
        data = request.json
        
        new_id = data['id'].strip().upper()
        if new_id != id and Student.query.get(new_id):
            return jsonify({'error': 'Student ID already exists'}), 400
        
        student.id = new_id
        student.first_name = data['first_name'].strip()
        student.last_name = data['last_name'].strip()
        student.year_level = int(data['year_level'])
        student.gender = data['gender']
        student.program_code = data['program_code'].strip().upper()
        
        db.session.commit()
        return jsonify(student.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<id>', methods=['DELETE'])
def delete_student(id):
    try:
        student = Student.query.get_or_404(id)
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/bulk-delete', methods=['POST'])
def bulk_delete_students():
    try:
        ids = request.json.get('ids', [])
        if not ids:
            return jsonify({'error': 'No IDs provided'}), 400
        
        Student.query.filter(Student.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'message': f'{len(ids)} students deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============== STATISTICS ROUTE ==============

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    return jsonify({
        'total_students': Student.query.count(),
        'total_programs': Program.query.count(),
        'total_colleges': College.query.count()
    })

# ============== TEST ROUTE ==============

@app.route('/')
def home():
    return jsonify({
        'message': 'Student Information System API',
        'status': 'running',
        'endpoints': [
            '/api/colleges',
            '/api/programs', 
            '/api/students',
            '/api/statistics'
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)