REM If you are reading this, hopefully you didn't try to run it yet. As this file is a batch file, EXTREME caution should be taken. I use it for compiling the exe file to facilitate arduino sending data to Collector.
cd C:\Github\open-collector\arduino
"C:\Users\Anthony Haffey\AppData\Roaming\Python\Scripts\pyinstaller.exe" --onefile arduinoHR.py
RD /S /Q "build"
move "dist\arduinoHR.exe" "arduinoHR.exe"
RD /S /Q "dist"