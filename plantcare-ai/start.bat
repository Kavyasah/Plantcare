@echo off
echo Starting PlantCare AI Backend (Gemini API)...
start cmd /k "cd backend && python app.py"

echo Starting PlantCare AI Frontend...
start cmd /k "python -m http.server 8081"

echo.
echo Both servers are starting in separate windows.
echo Frontend will be available at http://localhost:8081
echo Backend is running on http://localhost:5001
echo.
echo Press any key to exit this launcher window...
pause > nul
