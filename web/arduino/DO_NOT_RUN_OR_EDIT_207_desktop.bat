REM If you are reading this, hopefully you didn't try to run it yet. As this file is a batch file, EXTREME caution should be taken. I use it for compiling the exe file to facilitate arduino sending data to Collector.
cd "C:\Users\nt906822\OneDrive - University of Reading\Github\open-collector\arduino"
"C:\Users\nt906822\AppData\Local\Continuum\anaconda3\Scripts\pyinstaller" --onefile "arduinoHR.py" REM --onefile arduinoHR.py

rem -y -F --hidden-import bottle_websocket 

rem RD /S /Q "build"
rem move "dist\arduinoHR.exe" "arduinoHR.exe"
rem RD /S /Q "dist"