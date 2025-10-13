from extensions import db
from datetime import datetime

class Program(db.Model):
    __tablename__ = 'programs'
    
    code = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    college_code = db.Column(db.String(20), db.ForeignKey('colleges.code', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    students = db.relationship('Student', backref='program', cascade='all, delete-orphan', lazy=True)
    
    def to_dict(self):
        return {
            'code': self.code,
            'name': self.name,
            'college_code': self.college_code,
            'college_name': self.college.name if self.college else None,
            'student_count': len(self.students),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }