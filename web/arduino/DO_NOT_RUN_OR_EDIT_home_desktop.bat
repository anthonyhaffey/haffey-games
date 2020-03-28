REM If you are reading this, hopefully you didn't try to run it yet. As this file is a batch file, EXTREME caution should be taken. I use it for compiling the exe file to facilitate arduino sending data to Collector.
cd "D:\OneDrive - University of Reading\Github\open-collector\arduino"
"C:\Users\antho\AppData\Roaming\Python\Python36\Scripts\pyinstaller -y -F --hidden-import bottle-websocket "D:/OneDrive - University of Reading/Github/open-collector/arduino/arduinoHR.py" REM --onefile arduinoHR.py
RD /S /Q "build"
move "dist\arduinoHR.exe" "arduinoHR.exe"
RD /S /Q "dist"