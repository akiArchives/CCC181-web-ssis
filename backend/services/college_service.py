from db import get_db_connection
from psycopg2.extras import RealDictCursor
import psycopg2
import math

class CollegeService:
    @staticmethod
    def get_all_colleges(search_term=None, page=None, per_page=None, sort_by='code', sort_order='asc'):
        """Retrieves all colleges, with an optional search filter and sorting."""
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = """
                SELECT c.*, COUNT(p.code) as program_count 
                FROM colleges c
                LEFT JOIN programs p ON c.code = p.college_code
            """
            params = []
            where_clauses = []
            
            if search_term:
                where_clauses.append("(c.code ILIKE %s OR c.name ILIKE %s)")
                term = f"%{search_term}%"
                params.extend([term, term])
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            
            query += " GROUP BY c.code, c.name"
            
            # Sorting
            sort_map = {'code': 'c.code', 'name': 'c.name', 'program_count': 'program_count'}
            if sort_by in sort_map:
                query += f" ORDER BY {sort_map[sort_by]} {'DESC' if sort_order == 'desc' else 'ASC'}"
            
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
    def get_college_by_code(code):
        """Retrieves a single college by its code."""
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("SELECT * FROM colleges WHERE code = %s", (code,))
            return cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def create_college(data):
        """Creates a new college."""
        if not data.get('code') or not data.get('name'):
            raise ValueError('Code and name are required')

        code = data['code'].strip().upper()
        name = data['name'].strip()

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("SELECT code FROM colleges WHERE code = %s", (code,))
            if cursor.fetchone():
                raise ValueError('College code already exists')

            cursor.execute(
                "INSERT INTO colleges (code, name) VALUES (%s, %s) RETURNING *",
                (code, name)
            )
            college = cursor.fetchone()
            conn.commit()
            return college
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_college(college, data):
        """Updates an existing college."""
        old_code = college['code']
        new_code = data.get('code', old_code).strip().upper()
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            if new_code != old_code:
                cursor.execute("SELECT code FROM colleges WHERE code = %s", (new_code,))
                if cursor.fetchone():
                    raise ValueError('College code already exists')
            
            cursor.execute("""
                UPDATE colleges SET code = %s, name = %s 
                WHERE code = %s RETURNING *
            """, (
                new_code,
                data.get('name', college['name']).strip(),
                old_code
            ))
            
            updated_college = cursor.fetchone()
            conn.commit()
            return updated_college
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            raise ValueError('College name already exists')
        except psycopg2.errors.ForeignKeyViolation:
            conn.rollback()
            raise ValueError('Cannot update code: Database constraint violation. Ensure ON UPDATE CASCADE is set.')
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def delete_college(college):
        """Deletes a college."""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM colleges WHERE code = %s", (college['code'],))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def bulk_delete_colleges(codes):
        """Deletes multiple colleges by their codes."""
        if not codes:
            raise ValueError('No codes provided')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM colleges WHERE code IN %s", (tuple(codes),))
            num_deleted = cursor.rowcount
            conn.commit()
            return num_deleted
        finally:
            cursor.close()
            conn.close()