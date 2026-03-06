import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import tempfile
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes so frontend can communicate with it

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment!")

@app.route('/predict', methods=['POST'])
def predict():
    if not API_KEY:
        return jsonify({"error": "Gemini API key is not configured on the server."}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the file temporarily
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file.filename)
    file.save(temp_path)

    try:
        # Prompt for Gemini to act as an agricultural expert
        prompt = """
        You are an expert plant pathologist AI. Analyze this image of a plant leaf and diagnose its condition.
        You MUST return your response ONLY as a valid JSON object with the following exact keys and types:
        - "condition": string (The specific name of the disease, or "Healthy")
        - "plant": string (The name of the plant type, e.g., "Corn (Maize)")
        - "detected": boolean (true if diseased, false if healthy)
        - "confidence": string (A percentage between "80.0" and "99.9" representing your confidence, e.g., "95.6")
        - "severity": string (One of: "low", "medium", "high", "critical")
        - "severityText": string (A short phrase like "Moderate / Action Required")
        - "recommendations": array of strings (3 to 4 actionable recommendations for the farmer/gardener)

        Ensure the output is strictly valid JSON without any markdown formatting (no ```json).
        """

        # Upload the file to Gemini's File API for processing
        print(f"Uploading {file.filename} to Gemini...")
        sample_file = genai.upload_file(path=temp_path, display_name=file.filename)
        
        # Initialize the model (gemini-1.5-flash is great for vision tasks)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Generate content
        print("Generating diagnosis...")
        response = model.generate_content([sample_file, prompt])
        
        # Clean up the JSON response
        response_text = response.text.strip()
        # Remove markdown ticks if they accidentally get included
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse and return JSON
        diagnosis_data = json.loads(response_text)
        
        # Delete file from Gemini storage
        genai.delete_file(sample_file.name)
        
        return jsonify(diagnosis_data)
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up local temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    print("Starting PlantCare AI Backend Server on http://localhost:5001")
    if not API_KEY:
        print("!!! PLEASE ADD YOUR GEMINI_API_KEY TO The backend/ .env file !!!")
    app.run(debug=True, port=5001)
