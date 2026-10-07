@echo off
title Norvo Richtprijs
rem Dubbelklik: start Norvo Richtprijs op deze pc en opent hem in de browser. Sluit dit venster om te stoppen.
cd /d "%~dp0"
node server.mjs --open
pause
