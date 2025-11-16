import psycopg2
import os
from urllib.parse import urlparse

def get_db_connection():
    """
    Establishes a connection to the database using environment variables.
    Supports DATABASE_URL or individual DB_* variables.
    """
    db_url = os.getenv('DATABASE_URL')
    
    if db_url:
        # Parse DATABASE_URL (e.g., mysql://user:pass@host:port/dbname)
        return psycopg2.connect(db_url)
    else:
        # Fallback to individual variables
        return psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'sis_db'),
            port=os.getenv('DB_PORT', 5432)
        )

def init_db():
    """Initializes the database tables using raw SQL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        role VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create Colleges Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS colleges (
        code VARCHAR(20) PRIMARY KEY,
        name VARCHAR(200) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create Programs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS programs (
        code VARCHAR(20) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        college_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (college_code) REFERENCES colleges(code) ON DELETE SET NULL ON UPDATE CASCADE
    )
    """)

    # Create Students Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(20) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        year_level INT NOT NULL,
        gender VARCHAR(20) NOT NULL,
        program_code VARCHAR(20),
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_code) REFERENCES programs(code) ON DELETE SET NULL ON UPDATE CASCADE
    )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()