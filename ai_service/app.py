from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    
    try:
        # 1. Read image using OpenCV
        img_bytes = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
        
        # Resize for faster processing
        img = cv2.resize(img, (300, 300))
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 2. Define color ranges (HSV format)
        # Green (Healthy leaf)
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([95, 255, 255])
        
        # Brown / Yellow / Orange (Diseased spots)
        lower_brown = np.array([5, 50, 50])
        upper_brown = np.array([25, 255, 255])

        # 3. Create masks (find these colors in the image)
        mask_green = cv2.inRange(hsv, lower_green, upper_green)
        mask_brown = cv2.inRange(hsv, lower_brown, upper_brown)

        # 4. Count the pixels
        green_pixels = np.sum(mask_green == 255)
        brown_pixels = np.sum(mask_brown == 255)
        
        total_leaf_pixels = green_pixels + brown_pixels
        
        if total_leaf_pixels == 0:
            return jsonify({'error': 'Could not detect a leaf in the image.'}), 400

        # 5. Calculate the percentage of brown spots on the leaf
        brown_percentage = (brown_pixels / total_leaf_pixels) * 100

        # 6. Logic: If more than 3% of the leaf is brown, it's diseased
        if brown_percentage > 3.0:
            is_diseased = True
            confidence = min(99, round(80 + brown_percentage, 2))
        else:
            is_diseased = False
            confidence = min(99, round(90 + (100 - brown_percentage)/10, 2))

        if is_diseased:
            result = {
                'disease': 'Leaf Blight (Fungal Infection)',
                'solution': 'Apply copper-based fungicide. Remove infected leaves immediately to prevent spread.',
                'confidence': confidence,
                'status': 'Diseased'
            }
        else:
            result = {
                'disease': 'Healthy',
                'solution': 'Your plant is healthy! Keep watering and providing sunlight.',
                'confidence': confidence,
                'status': 'Healthy'
            }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)