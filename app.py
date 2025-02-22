from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from analyzer import LightDisasterAnalyzer, visualize_damage_simple
import tempfile

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/analyze', methods=['POST'])
def analyze_images():
    if 'before' not in request.files or 'after' not in request.files:
        return jsonify({'error': 'Both before and after images are required'}), 400

    before_image = request.files['before']
    after_image = request.files['after']

    # Save uploaded files
    before_path = os.path.join(UPLOAD_FOLDER, secure_filename(before_image.filename))
    after_path = os.path.join(UPLOAD_FOLDER, secure_filename(after_image.filename))
    
    before_image.save(before_path)
    after_image.save(after_path)

    # Create temporary file for result
    result_path = os.path.join(UPLOAD_FOLDER, 'result.jpg')

    try:
        # Analyze images
        analyzer = LightDisasterAnalyzer()
        result = analyzer.calculate_damage_intensity(before_path, after_path)
        
        # Generate visualization
        visualize_damage_simple(before_path, after_path, result_path)

        # Read the result image
        with open(result_path, 'rb') as f:
            result_image = f.read()

        # Clean up
        os.remove(before_path)
        os.remove(after_path)
        os.remove(result_path)

        return jsonify({
            'analysis': result,
            'visualization': f'/api/result-image/{os.path.basename(result_path)}'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/result-image/<filename>')
def get_result_image(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

if __name__ == '__main__':
    app.run(debug=True, port=5000)