# 🌱 PlantCare AI - Disease Detection System

PlantCare AI is an intelligent agricultural diagnostic web platform. It allows farmers, home gardeners, and agricultural researchers to upload images of plant leaves and receive instant, accurate disease classifications and treatment recommendations powered by artificial intelligence.

## ✨ Features

- **High Accuracy AI Diagnosis:** Leverages the Google Gemini Vision API to accurately identify 38+ plant diseases.
- **Real-Time Results:** Instant processing and feedback on leaf condition, confidence score, and severity level.
- **Actionable Recommendations:** Provides immediate, practical treatment steps based on the diagnosed condition.
- **Modern & Responsive UI:** A clean, agriculture-themed interface that works flawlessly across desktops and mobile devices.
- **Local Privacy:** No image data is persistently logged; images are dynamically processed and discarded securely.

## 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- BoxIcons for scalable iconography
- Google Fonts (Outfit, Inter)

**Backend:**
- Python 3.x
- Flask (API serving)
- Google Generative AI SDK (Gemini 1.5-Flash model)
- Flask-CORS

## 🚀 Getting Started (Local Development)

Follow these steps to run the PlantCare AI platform locally on your machine.

### Prerequisites

Ensure you have **Python 3.x** installed on your system. 

### 1. Install Dependencies

Open your terminal in the project root directory and install the required Python packages:

```bash
pip install flask flask-cors python-dotenv google-generativeai
```

### 2. Configure Environment Variables

The backend relies on the Gemini AI API for image analysis.

1. Navigate to the `backend/` folder.
2. Ensure you have a `.env` file containing your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```
*(You can obtain a free API key from Google AI Studio)*

### 3. Run the Application (Windows)

For Windows users, a convenient launcher script is included. Simply double-click the `start.bat` file in the root directory. 

Alternatively, to run manually:

**Start the Backend Server:**
```bash
cd backend
python app.py
```
*(The API will run on http://localhost:5001)*

**Start the Frontend Server:**
Open a *new* terminal at the project root and run:
```bash
python -m http.server 8081
```

### 4. Use the App
Open your web browser and navigate to:
**http://localhost:8081**

## 👥 Meet the Team

Developed for the Smartbridge Project by:
- **Kavya Jain** (Team Lead)
- **Kavya Narayan Sharma** (Member)
- **Kavya Sahu** (Member)
- **Khushi Yadav** (Member)

## 📄 License

This project is open-source and created for educational and agricultural preservation purposes.
