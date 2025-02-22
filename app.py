from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from analyzer import LightDisasterAnalyzer, visualize_damage_simple
import tempfile
import uuid

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
    
    # Generate unique filenames
    unique_id = str(uuid.uuid4())
    before_path = os.path.join(UPLOAD_FOLDER, f'before_{unique_id}.jpg')
    after_path = os.path.join(UPLOAD_FOLDER, f'after_{unique_id}.jpg')
    result_path = os.path.join(UPLOAD_FOLDER, f'result_{unique_id}.jpg')
    
    try:
        # Save uploaded files
        before_image.save(before_path)
        after_image.save(after_path)
        
        # Analyze images
        analyzer = LightDisasterAnalyzer()
        result = analyzer.calculate_damage_intensity(before_path, after_path)
        
        # Generate visualization
        visualize_damage_simple(before_path, after_path, result_path)
        
        # Clean up input images
        os.remove(before_path)
        os.remove(after_path)
        
        # Don't delete result_path yet - it's needed for the get_result_image endpoint
        return jsonify({
            'analysis': result,
            'visualization': f'/api/result-image/result_{unique_id}.jpg'
        })
        
    except Exception as e:
        # Clean up in case of error
        for path in [before_path, after_path, result_path]:
            if os.path.exists(path):
                os.remove(path)
        return jsonify({'error': str(e)}), 500

@app.route('/api/result-image/<filename>')
def get_result_image(filename):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                app.logger.error(f"Error cleaning up file {file_path}: {e}")
            return response
            
        return send_file(file_path, mimetype='image/jpeg')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)