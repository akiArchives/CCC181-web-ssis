from extensions import db
from datetime import datetime

class College(db.Model):
    __tablename__ = 'colleges'
    
    code = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    programs = db.relationship('Program', backref='college', cascade='all, delete-orphan', lazy=True)
    
    def to_dict(self):
        return {
            'code': self.code,
            'name': self.name,
            'program_count': len(self.programs),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }