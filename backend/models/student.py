from extensions import db
from datetime import datetime

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.String(20), primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    year_level = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    program_code = db.Column(db.String(20), db.ForeignKey('programs.code', ondelete='CASCADE'), nullable=False)
    photo_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'year_level': self.year_level,
            'gender': self.gender,
            'program_code': self.program_code,
            'program_name': self.program.name if self.program else None,
            'college_code': self.program.college_code if self.program else None,
            'college_name': self.program.college.name if self.program and self.program.college else None,
            'photo_url': self.photo_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }