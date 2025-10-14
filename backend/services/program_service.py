from models import db, Program, College
from sqlalchemy import or_

class ProgramService:
    @staticmethod
    def get_all_programs(search_term=None, page=None, per_page=None):
        """Retrieves all programs, with an optional search filter."""
        query = Program.query
        if search_term:
            query = query.filter(
                or_(
                    Program.code.ilike(f'%{search_term}%'),
                    Program.name.ilike(f'%{search_term}%')
                )
            )
        
        if page is not None and per_page is not None:
            return query.paginate(page=page, per_page=per_page, error_out=False)
        
        return query.all()

    @staticmethod
    def get_program_by_code(code):
        """Retrieves a single program by its code."""
        return Program.query.get(code)

    @staticmethod
    def create_program(data):
        """Creates a new program."""
        if not data.get('code') or not data.get('name') or not data.get('college_code'):
            raise ValueError('Code, name, and college are required')

        program_code = data['code'].strip().upper()
        name = data['name'].strip()
        college_code = data['college_code'].strip().upper()

        if Program.query.get(program_code):
            raise ValueError('Program code already exists')

        if not College.query.get(college_code):
            raise ValueError('College does not exist')

        program = Program(
            code=program_code,
            name=name,
            college_code=college_code
        )
        
        db.session.add(program)
        db.session.commit()
        return program

    @staticmethod
    def update_program(program, data):
        """Updates an existing program."""
        new_code = data.get('code', program.code).strip().upper()
        
        if new_code != program.code and Program.query.get(new_code):
            raise ValueError('Program code already exists')
        
        program.code = new_code
        program.name = data.get('name', program.name).strip()
        program.college_code = data.get('college_code', program.college_code).strip().upper()
        
        db.session.commit()
        return program

    @staticmethod
    def delete_program(program):
        """Deletes a program."""
        db.session.delete(program)
        db.session.commit()

    @staticmethod
    def bulk_delete_programs(codes):
        """Deletes multiple programs by their codes."""
        if not codes:
            raise ValueError('No codes provided')
        
        num_deleted = Program.query.filter(Program.code.in_(codes)).delete(synchronize_session=False)
        db.session.commit()
        return num_deleted