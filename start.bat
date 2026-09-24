@echo off
echo ========================================================
echo   Starting DailyTrack - Personal Productivity System
echo ========================================================
echo Starting Backend on http://localhost:5000 ...
start "DailyTrack Backend" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "DailyTrack Frontend" cmd /k "cd client && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo DailyTrack is running!
pause
