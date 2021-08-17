@echo off
setlocal
rem Javaのパスを設定してください
rem set PATH=C:\pleiades\java\jdk-16\bin;%PATH%
set CURRENT=%~dp0
java -jar "%CURRENT%xsm.jar" -library %CURRENT%\library\ %*
endlocal
