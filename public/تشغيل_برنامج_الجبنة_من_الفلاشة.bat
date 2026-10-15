@echo off
chcp 65001 >nul
title نظام إدارة معمل ومصنع الأجبان - تشغيل محمول من الفلاشة USB (العملة: شيكل ₪)
color 0E
echo ==============================================================================
echo       نظام إدارة معمل ومصنع الأجبان - النسخة المحمولة (USB Portable)
echo                        العملة المعتمدة: شيكل ₪
echo           تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
echo ==============================================================================
echo.
echo بيانات تسجيل الدخول:
echo   اسم المستخدم: admin
echo   كلمة المرور: 123456
echo.
echo جاري تشغيل البرنامج من الفلاشة على هذا الكمبيوتر دون الحاجة للإنترنت...
echo.

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%~dp0تشغيل_مصنع_الأجبان_المحمول.html"
    goto END
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%~dp0تشغيل_مصنع_الأجبان_المحمول.html"
    goto END
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%~dp0تشغيل_مصنع_الأجبان_المحمول.html"
    goto END
)

start "" "%~dp0تشغيل_مصنع_الأجبان_المحمول.html"

:END
echo تم تشغيل البرنامج بنجاح. يمكنك إغلاق هذه النافذة.
timeout /t 3 >nul
exit
