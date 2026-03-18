:: Run npm update in 'auth' in a new window
start cmd /c "npm cache clean --force"
timeout /t 5 /nobreak >nul
start cmd /c "cd auth && npm install"

start cmd /c "cd inventory && npm install"

:: Run npm update in 'order' in a new window
start cmd /c "cd order && npm install"

start cmd /c "cd payment && npm install"

:: Run npm update in 'product' in a new window
start cmd /c "cd product && npm install"

start cmd /c "cd expiration && npm install"