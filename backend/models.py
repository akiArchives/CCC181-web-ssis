from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'admin' or 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

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


class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.String(20), primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    year_level = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    program_code = db.Column(db.String(20), db.ForeignKey('programs.code', ondelete='CASCADE'), nullable=False)
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }