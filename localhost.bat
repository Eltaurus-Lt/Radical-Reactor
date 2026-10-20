start cmd /k "py -m http.server 8000"
timeout /t 2 /nobreak >nul
start http://localhost:8000/main.html