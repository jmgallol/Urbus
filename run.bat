@echo off
cd /d "C:\Users\juanm\Documents\Traccat-Server"
java -Dorg.traccar.config=traccar.xml -jar target\tracker-server.jar
