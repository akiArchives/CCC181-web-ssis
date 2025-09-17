from flask import Flask
from flask_cors import CORS


def create_app(config_object=None):
	# templates and static kept inside the package for import/IDE friendliness
	app = Flask(__name__, template_folder='templates', static_folder='static')
	if config_object:
		app.config.from_object(config_object)
	CORS(app)

	from .routes import main_bp
	app.register_blueprint(main_bp)

	return app
