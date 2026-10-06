@echo off
rem Dubbelklik: start de Richtprijs-AI op deze pc en opent hem in de browser. Sluit dit venster om te stoppen.
cd /d "%~dp0"
node server.mjs --open
pause
