from flask import Blueprint, render_template, send_from_directory, current_app, jsonify
import os

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def home():
    return render_template('index.html', user='Guest')


@main_bp.route('/<path:path>')
def static_proxy(path):
    # Serve static files from the package `static` directory if they exist
    static_dir = os.path.join(current_app.root_path, 'static')
    file_path = os.path.join(static_dir, path)
    if os.path.exists(file_path):
        return send_from_directory(static_dir, path)
    return render_template('index.html')

@main_bp.route('/api/hello')
def api_hello():
    return jsonify({ "message": "Hello from Flask" })
