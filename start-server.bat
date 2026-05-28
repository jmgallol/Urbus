@echo off
REM Start server in background
java -Dorg.traccar.config=traccar.xml -jar target\tracker-server.jar
if errorlevel 1 (
    echo.
    echo ERROR: No se pudo iniciar el servidor
    echo Presiona cualquier tecla para salir...
    pause
)
