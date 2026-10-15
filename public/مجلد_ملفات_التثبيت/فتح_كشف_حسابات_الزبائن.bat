@echo off
chcp 65001 >nul
title كشف حسابات كافة الزبائن للفلاشة USB (العملة: شيكل ₪)
color 0B
echo ==============================================================================
echo       نظام إدارة معمل ومصنع الأجبان - كشف حسابات الزبائن والذمم
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
echo بيانات الحماية والدخول:
echo   اسم المستخدم (Username): admin
echo   كلمة المرور (Password): 123456
echo   رمز الدخول السريع (PIN): 1234
echo.
echo جاري فتح كشف حسابات الزبائن بدون إنترنت لمناقشتهم في أماكنهم...
echo.

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%~dp0كشف_حسابات_الزبائن_للفلاشة.html"
    goto END
)

start "" "%~dp0كشف_حسابات_الزبائن_للفلاشة.html"

:END
echo تم فتح كشف الحساب بنجاح.
timeout /t 3 >nul
exit
