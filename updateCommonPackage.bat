:: Run npm update in 'auth' in a new window
start cmd /c "cd auth && npm install @tabletennisshop/common@latest && pause"

:: Run npm update in 'order' in a new window
start cmd /c "cd order && npm install @tabletennisshop/common@latest && pause"

:: Run npm update in 'product' in a new window
start cmd /c "cd product && npm install @tabletennisshop/common@latest && pause"

start cmd /c "cd seed && npm install @tabletennisshop/common@latest && pause"

start cmd /c "cd cart && npm install @tabletennisshop/common@latest && pause"
