from db import get_db_connection
from psycopg2.extras import RealDictCursor
import math

class ProgramService:
    @staticmethod
    def get_all_programs(search_term=None, page=None, per_page=None, sort_by='code', sort_order='asc'):
        """Retrieves all programs, with an optional search filter and sorting."""
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Base query with join for college name sorting/display
            query = """
                SELECT p.*, c.name as college_name 
                FROM programs p 
                LEFT JOIN colleges c ON p.college_code = c.code
            """
            params = []
            where_clauses = []
            
            if search_term:
                term = f"%{search_term}%"
                where_clauses.append("(p.code ILIKE %s OR p.name ILIKE %s)")
                params.extend([term, term])
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            
            # Sorting logic
            if sort_by == 'college_name':
                query += f" ORDER BY c.name {'DESC' if sort_order == 'desc' else 'ASC'}"
            else:
                valid_columns = {'code': 'p.code', 'name': 'p.name', 'college_code': 'p.college_code'}
                col = valid_columns.get(sort_by, 'p.code')
                query += f" ORDER BY {col} {'DESC' if sort_order == 'desc' else 'ASC'}"
            
            if page is not None and per_page is not None:
                count_query = f"SELECT COUNT(*) as total FROM ({query}) as subquery"
                cursor.execute(count_query, tuple(params))
                total = cursor.fetchone()['total']
                
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
    def get_program_by_code(code):
        """Retrieves a single program by its code."""
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("SELECT * FROM programs WHERE code = %s", (code,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_program(data):
        """Creates a new program."""
        if not data.get('code') or not data.get('name') or not data.get('college_code'):
            raise ValueError('Code, name, and college are required')

        program_code = data['code'].strip().upper()
        name = data['name'].strip()
        college_code = data['college_code'].strip().upper()

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("SELECT code FROM programs WHERE code = %s", (program_code,))
            if cursor.fetchone():
                raise ValueError('Program code already exists')

            cursor.execute("SELECT code FROM colleges WHERE code = %s", (college_code,))
            if not cursor.fetchone():
                raise ValueError('College does not exist')

            cursor.execute("""
                INSERT INTO programs (code, name, college_code)
                VALUES (%s, %s, %s)
                RETURNING *
            """, (program_code, name, college_code))
            
            program = cursor.fetchone()
            conn.commit()
            return program
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_program(program, data):
        """Updates an existing program."""
        old_code = program['code']
        new_code = data.get('code', old_code).strip().upper()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            if new_code != old_code:
                cursor.execute("SELECT code FROM programs WHERE code = %s", (new_code,))
                if cursor.fetchone():
                    raise ValueError('Program code already exists')
            
            # Check college if changing
            college_code = data.get('college_code', program['college_code']).strip().upper()
            if college_code != program['college_code']:
                cursor.execute("SELECT code FROM colleges WHERE code = %s", (college_code,))
                if not cursor.fetchone():
                    raise ValueError('College does not exist')

            cursor.execute("""
                UPDATE programs 
                SET code = %s, name = %s, college_code = %s
                WHERE code = %s
                RETURNING *
            """, (
                new_code,
                data.get('name', program['name']).strip(),
                college_code,
                old_code
            ))
            
            updated_program = cursor.fetchone()
            conn.commit()
            return updated_program
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_program(program):
        """Deletes a program."""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM programs WHERE code = %s", (program['code'],))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def bulk_delete_programs(codes):
        """Deletes multiple programs by their codes."""
        if not codes:
            raise ValueError('No codes provided')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM programs WHERE code IN %s", (tuple(codes),))
            num_deleted = cursor.rowcount
            conn.commit()
            return num_deleted
        finally:
            cursor.close()
            conn.close()