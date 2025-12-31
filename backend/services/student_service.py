from db import get_db_connection
from psycopg2.extras import RealDictCursor
import re
import math
from flask import request

class StudentService:
    @staticmethod
    def get_all_students(search_term=None, page=None, per_page=None, sort_by='id', sort_order='asc', program_code=None, year_level=None, gender=None):
        
        try:
            if program_code is None:
                program_code = request.args.get('program_code')
            if year_level is None:
                year_level = request.args.get('year_level')
            if gender is None:
                gender = request.args.get('gender')
        except:
            pass
    
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Join with programs and colleges to get names
            query = """
                SELECT s.*, p.name as program_name, c.name as college_name, p.college_code
                FROM students s
                LEFT JOIN programs p ON s.program_code = p.code
                LEFT JOIN colleges c ON p.college_code = c.code
            """
            params = []
            conditions = []
            
            if search_term:
                conditions.append("(s.id ILIKE %s OR s.first_name ILIKE %s OR s.last_name ILIKE %s)")
                term = f"%{search_term}%"
                params.extend([term, term, term])
            
            if program_code:
                conditions.append("s.program_code = %s")
                params.append(program_code)
            
            if year_level:
                conditions.append("s.year_level = %s")
                params.append(int(year_level))
            
            if gender:
                conditions.append("s.gender = %s")
                params.append(gender)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            # Sorting
            sort_map = {
                'id': 's.id',
                'first_name': 's.first_name',
                'last_name': 's.last_name',
                'year_level': 's.year_level',
                'gender': 's.gender',
                'program_code': 's.program_code',
                'program_name': 'p.name',
                'college_name': 'c.name',
                'college_code': 'p.college_code'
            }
            
            if sort_by in sort_map:
                query += f" ORDER BY {sort_map[sort_by]} {'DESC' if sort_order == 'desc' else 'ASC'}"
            
            if page is not None and per_page is not None:
                # Get total count for pagination
                count_query = f"SELECT COUNT(*) as total FROM ({query}) as subquery"
                cursor.execute(count_query, tuple(params))
                total = cursor.fetchone()['total']
                
                # Apply limit and offset
                query += " LIMIT %s OFFSET %s"
                offset = (page - 1) * per_page
                params.extend([per_page, offset])
                
                cursor.execute(query, tuple(params))
                items = cursor.fetchall()
                
                return {
                    'items': items,
                    'total': total,
                    'pages': math.ceil(total / per_page),
                    'page': page,
                    'per_page': per_page
                }
            
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_student_by_id(student_id):
        """Retrieves a single student by their ID."""
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT s.*, p.name as program_name, c.name as college_name, p.college_code
                FROM students s
                LEFT JOIN programs p ON s.program_code = p.code
                LEFT JOIN colleges c ON p.college_code = c.code
                WHERE s.id = %s
            """, (student_id,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_student(data):
        """
        Creates a new student.
        Raises ValueError for business rule violations (e.g., missing fields, duplicates).
        """
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        required = ['id', 'first_name', 'last_name', 'year_level', 'gender', 'program_code']
        for field in required:
            if not data.get(field):
                raise ValueError(f'Missing required field: {field}')

        student_id = data['id'].strip().upper()
        if not re.match(r'^\d{4}-\d{4}$', student_id):
            raise ValueError('Student ID must follow the format NNNN-NNNN (e.g., 2021-0001)')

        program_code = data['program_code'].strip()

        try:
            # Check duplicates
            cursor.execute("SELECT id FROM students WHERE id = %s", (student_id,))
            if cursor.fetchone():
                raise ValueError('Student ID already exists')

            # Check program existence
            cursor.execute("SELECT code FROM programs WHERE code = %s", (program_code,))
            if not cursor.fetchone():
                raise ValueError('Program does not exist')

            cursor.execute("""
                INSERT INTO students (id, first_name, last_name, year_level, gender, program_code, photo_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                student_id,
                data['first_name'].strip(),
                data['last_name'].strip(),
                int(data['year_level']),
                data['gender'],
                program_code,
                data.get('photo_url')
            ))
            
            new_student = cursor.fetchone()
            conn.commit()
            return new_student
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_student(student, data):
        """Updates an existing student."""
        # 'student' is now a dict from get_student_by_id
        old_id = student['id']
        new_id = data.get('id', old_id).strip().upper()
        
        if not re.match(r'^\d{4}-\d{4}$', new_id):
            raise ValueError('Student ID must follow the format NNNN-NNNN (e.g., 2021-0001)')

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            if new_id != old_id:
                cursor.execute("SELECT id FROM students WHERE id = %s", (new_id,))
                if cursor.fetchone():
                    raise ValueError('New Student ID already exists')
            
            # Check program if changing
            raw_program_code = data.get('program_code', student['program_code'])
            program_code = raw_program_code.strip() if raw_program_code else None
            
            if program_code != student['program_code']:
                if program_code:
                    cursor.execute("SELECT code FROM programs WHERE code = %s", (program_code,))
                    if not cursor.fetchone():
                        raise ValueError(f'Program {program_code} does not exist')

            cursor.execute("""
                UPDATE students 
                SET id = %s, first_name = %s, last_name = %s, year_level = %s, 
                    gender = %s, program_code = %s, photo_url = %s
                WHERE id = %s
                RETURNING *
            """, (
                new_id,
                data.get('first_name', student['first_name']).strip(),
                data.get('last_name', student['last_name']).strip(),
                int(data.get('year_level', student['year_level'])),
                data.get('gender', student['gender']),
                program_code,
                data.get('photo_url', student['photo_url']),
                old_id
            ))
            
            updated_student = cursor.fetchone()
            conn.commit()
            return updated_student
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_student(student):
        """Deletes a student."""
        # 'student' is a dict, we need the id
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM students WHERE id = %s", (student['id'],))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def bulk_delete_students(ids):
        """Deletes multiple students by their IDs."""
        if not ids:
            raise ValueError('No student IDs provided for bulk deletion')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            # psycopg2 handles tuple adaptation for IN clause
            cursor.execute("DELETE FROM students WHERE id IN %s", (tuple(ids),))
            num_deleted = cursor.rowcount
            conn.commit()
            return num_deleted
        finally:
            cursor.close()
            conn.close()