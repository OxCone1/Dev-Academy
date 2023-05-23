@echo off

echo Installing dependencies for Frontend...
cd frontend
call npm install
cd ..

echo Installing dependencies for Server...
cd server
call npm install
cd ..

echo Installing dependencies for Testing...
cd testing
call npm install
cd ..

echo All dependencies installed successfully.