@echo off
REM Start server in background
start "Traccar Server" cmd /k java -Dorg.traccar.config=traccar.xml -jar target\tracker-server.jar
echo Server started in background window
echo Access the app at: http://localhost:8082
timeout /t 2
