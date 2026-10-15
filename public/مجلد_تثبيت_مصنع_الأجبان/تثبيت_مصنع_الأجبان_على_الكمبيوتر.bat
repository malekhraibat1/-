@echo off
chcp 65001 >nul
title مثبت برنامج مصنع ومعمل الأجبان (Setup & Installation)
color 0B
cls
echo ==============================================================================
echo           برنامج تثبيت نظام مصنع ومعمل الأجبان - الإصدار المكتبي
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.

:: التحقق أولاً من وجود برنامج التثبيت الذاتي التنفيذي المباشر EXE
if exist "%~dp0Setup_CheeseFactory.exe" (
    echo [موصى به] تم العثور على برنامج التثبيت التنفيذي المباشر Setup_CheeseFactory.exe...
    echo جاري تشغيل معالج التثبيت الذاتي الآن...
    start "" "%~dp0Setup_CheeseFactory.exe"
    exit
)
if exist "%~dp0تثبيت_مصنع_الأجبان.exe" (
    echo [موصى به] تم العثور على برنامج التثبيت التنفيذي المباشر تثبيت_مصنع_الأجبان.exe...
    echo جاري تشغيل معالج التثبيت الذاتي الآن...
    start "" "%~dp0تثبيت_مصنع_الأجبان.exe"
    exit
)

echo [1/4] جاري تجهيز مجلدات التثبيت وقاعدة البيانات...

:: فحص صلاحيات المجلد: إذا كانت صلاحيات المسؤول متوفرة نثبت في C:\CheeseFactory وإلا نثبت في مجلد المستخدم المحلي %LOCALAPPDATA%\CheeseFactory
set "INSTALL_DIR=C:\CheeseFactory"
mkdir "%INSTALL_DIR%" >nul 2>&1
if not exist "%INSTALL_DIR%" (
    set "INSTALL_DIR=%LOCALAPPDATA%\CheeseFactory"
    mkdir "%INSTALL_DIR%" >nul 2>&1
)

if not exist "%INSTALL_DIR%\database" mkdir "%INSTALL_DIR%\database"
if not exist "%INSTALL_DIR%\backups" mkdir "%INSTALL_DIR%\backups"
echo   - تم إنشاء مجلد البرنامج: %INSTALL_DIR%
echo   - مكان حفظ قاعدة البيانات: %INSTALL_DIR%\database\dairy_database.json

echo.
echo [2/4] جاري نسخ وإنشاء ملفات التشغيل المستقل...
(
echo @echo off
echo chcp 65001 ^>nul
echo title نظام مصنع ومعمل الأجبان ^(العملة: شيكل ₪^)
echo cd /d "%%~dp0"
echo if exist "%%ProgramFiles%%\Google\Chrome\Application\chrome.exe" ^(
echo     start "" "%%ProgramFiles%%\Google\Chrome\Application\chrome.exe" --app="%%~dp0index.html"
echo     exit
echo ^)
echo if exist "%%ProgramFiles(x86)%%\Google\Chrome\Application\chrome.exe" ^(
echo     start "" "%%ProgramFiles(x86)%%\Google\Chrome\Application\chrome.exe" --app="%%~dp0index.html"
echo     exit
echo ^)
echo if exist "%%ProgramFiles(x86)%%\Microsoft\Edge\Application\msedge.exe" ^(
echo     start "" "%%ProgramFiles(x86)%%\Microsoft\Edge\Application\msedge.exe" --app="%%~dp0index.html"
echo     exit
echo ^)
echo if exist "%%ProgramFiles%%\Microsoft\Edge\Application\msedge.exe" ^(
echo     start "" "%%ProgramFiles%%\Microsoft\Edge\Application\msedge.exe" --app="%%~dp0index.html"
echo     exit
echo ^)
echo start "" "%%~dp0index.html"
echo exit
) > "%INSTALL_DIR%\تشغيل_المصنع.bat"

if exist "%~dp0dairy_database.json" (
    copy /y "%~dp0dairy_database.json" "%INSTALL_DIR%\database\dairy_database.json" >nul
    echo   - تم استيراد ملف قاعدة البيانات بنجاح إلى: %INSTALL_DIR%\database\
)
if exist "%~dp0تشغيل_مصنع_الأجبان_المحمول.html" (
    copy /y "%~dp0تشغيل_مصنع_الأجبان_المحمول.html" "%INSTALL_DIR%\index.html" >nul
    echo   - تم استيراد صفحة البرنامج المستقلة إلى: %INSTALL_DIR%\index.html
)
if exist "%~dp0كشف_حسابات_الزبائن_للفلاشة.html" (
    copy /y "%~dp0كشف_حسابات_الزبائن_للفلاشة.html" "%INSTALL_DIR%\كشف_حسابات_الزبائن.html" >nul
    echo   - تم نسخ كشف حسابات الزبائن إلى: %INSTALL_DIR%\
)
if exist "%~dp0اقرأني_دليل_التشغيل_وكلمة_السر.txt" (
    copy /y "%~dp0اقرأني_دليل_التشغيل_وكلمة_السر.txt" "%INSTALL_DIR%\اقرأني_دليل_التشغيل_وكلمة_السر.txt" >nul
)
if exist "%~dp0app_icon.ico" (
    copy /y "%~dp0app_icon.ico" "%INSTALL_DIR%\app_icon.ico" >nul
)

echo.
echo [3/4] جاري إنشاء اختصارات البرنامج على سطح المكتب (Desktop Shortcuts)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'مصنع ومعمل الأجبان.lnk')); $s.TargetPath = '%INSTALL_DIR%\تشغيل_المصنع.bat'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'نظام إدارة مصنع ومعمل الأجبان'; $s.Save()" >nul 2>&1
echo   - تم وضع اختصار "مصنع ومعمل الأجبان" على سطح المكتب بنجاح!

if exist "%INSTALL_DIR%\كشف_حسابات_الزبائن.html" (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'كشف حسابات الزبائن.lnk')); $s.TargetPath = '%INSTALL_DIR%\كشف_حسابات_الزبائن.html'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'كشف حسابات الزبائن والمبيعات'; $s.Save()" >nul 2>&1
    echo   - تم وضع اختصار "كشف حسابات الزبائن" على سطح المكتب بنجاح!
)

echo.
echo [4/4] اكتمل التثبيت بنجاح تام!
echo ==============================================================================
echo   مكان قاعدة البيانات (Database Path):
echo   %INSTALL_DIR%\database\dairy_database.json
echo.
echo   مكان النسخ الاحتياطية (Backups Path):
echo   %INSTALL_DIR%\backups\
echo.
echo   بيانات الدخول والحماية الافتراضية:
echo   اسم المستخدم (Username): admin
echo   كلمة المرور (Password): 123456
echo   رمز الدخول السريع (PIN): 1234
echo.
echo   تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
echo يمكنك الآن فتح البرنامج من سطح المكتب في أي وقت بدون إنترنت.
pause
exit
