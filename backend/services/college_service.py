from models import db, College
from sqlalchemy import or_

class CollegeService:
    @staticmethod
    def get_all_colleges(search_term=None, page=None, per_page=None):
        """Retrieves all colleges, with an optional search filter."""
        query = College.query
        if search_term:
            query = query.filter(
                or_(
                    College.code.ilike(f'%{search_term}%'),
                    College.name.ilike(f'%{search_term}%')
                )
            )
        
        if page is not None and per_page is not None:
            return query.paginate(page=page, per_page=per_page, error_out=False)
            
        return query.all()

    @staticmethod
    def get_college_by_code(code):
        """Retrieves a single college by its code."""
        return College.query.get(code)

    @staticmethod
    def create_college(data):
        """Creates a new college."""
        if not data.get('code') or not data.get('name'):
            raise ValueError('Code and name are required')

        code = data['code'].strip().upper()
        name = data['name'].strip()

        if College.query.get(code):
            raise ValueError('College code already exists')

        college = College(code=code, name=name)
        db.session.add(college)
        db.session.commit()
        return college

    @staticmethod
    def update_college(college, data):
        """Updates an existing college."""
        new_code = data.get('code', college.code).strip().upper()
        
        if new_code != college.code and College.query.get(new_code):
            raise ValueError('College code already exists')
        
        college.code = new_code
        college.name = data.get('name', college.name).strip()
        
        db.session.commit()
        return college

    @staticmethod
    def delete_college(college):
        """Deletes a college."""
        db.session.delete(college)
        db.session.commit()

    @staticmethod
    def bulk_delete_colleges(codes):
        """Deletes multiple colleges by their codes."""
        if not codes:
            raise ValueError('No codes provided')
        
        num_deleted = College.query.filter(College.code.in_(codes)).delete(synchronize_session=False)
        db.session.commit()
        return num_deleted