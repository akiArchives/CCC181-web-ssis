from models import db, Student, Program
from sqlalchemy import or_

class StudentService:
    @staticmethod
    def get_all_students(search_term=None):
        """Retrieves all students, with an optional search filter."""
        query = Student.query
        if search_term:
            query = query.filter(
                or_(
                    Student.id.ilike(f'%{search_term}%'),
                    Student.first_name.ilike(f'%{search_term}%'),
                    Student.last_name.ilike(f'%{search_term}%')
                )
            )
        return query.all()

    @staticmethod
    def get_student_by_id(student_id):
        """Retrieves a single student by their ID."""
        return Student.query.get(student_id)

    @staticmethod
    def create_student(data):
        """
        Creates a new student.
        Raises ValueError for business rule violations (e.g., missing fields, duplicates).
        """
        required = ['id', 'first_name', 'last_name', 'year_level', 'gender', 'program_code']
        for field in required:
            if not data.get(field):
                raise ValueError(f'Missing required field: {field}')

        student_id = data['id'].strip().upper()
        program_code = data['program_code'].strip().upper()

        if Student.query.get(student_id):
            raise ValueError('Student ID already exists')

        if not Program.query.get(program_code):
            raise ValueError('Program does not exist')

        new_student = Student(
            id=student_id,
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            year_level=int(data['year_level']),
            gender=data['gender'],
            program_code=program_code
        )
        
        db.session.add(new_student)
        db.session.commit()
        return new_student

    @staticmethod
    def update_student(student, data):
        """Updates an existing student."""
        new_id = data.get('id', student.id).strip().upper()
        if new_id != student.id and Student.query.get(new_id):
            raise ValueError('New Student ID already exists')
        
        student.id = new_id
        student.first_name = data.get('first_name', student.first_name).strip()
        student.last_name = data.get('last_name', student.last_name).strip()
        student.year_level = int(data.get('year_level', student.year_level))
        student.gender = data.get('gender', student.gender)
        student.program_code = data.get('program_code', student.program_code).strip().upper()
        
        db.session.commit()
        return student

    @staticmethod
    def delete_student(student):
        """Deletes a student."""
        db.session.delete(student)
        db.session.commit()

    @staticmethod
    def bulk_delete_students(ids):
        """Deletes multiple students by their IDs."""
        if not ids:
            raise ValueError('No student IDs provided for bulk deletion')
        
        num_deleted = Student.query.filter(Student.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return num_deleted