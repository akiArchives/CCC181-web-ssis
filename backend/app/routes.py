from flask import render_template
from app import app  # Import the app instance directly

@app.route('/')
def home():
    return render_template("index.html", user="Guest")
