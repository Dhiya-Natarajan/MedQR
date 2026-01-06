from flask import Flask, request, jsonify
import easyocr
import numpy as np
import cv2
from PIL import Image
import io
import traceback

app = Flask(__name__)

easy_ocr = easyocr.Reader(['en'], gpu=False)

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = np.array(image)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    return gray

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        image_bytes = file.read()
        image = preprocess_image(image_bytes)

        result = easy_ocr.readtext(image)
        text = "\n".join([line[1] for line in result])

        return jsonify({
            "combined_text": text
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "OCR processing failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=5000)
