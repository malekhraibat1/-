Unicode True

; ----------------------------------------------------------------------
; نظام مصنع ومعمل الأجبان - برنامج التثبيت المكتبي الرسمي لويندوز
; تصميم وتطوير: المهندس مالك حريبات - للتواصل: 0594345464
; ----------------------------------------------------------------------

!define PRODUCT_NAME "مصنع ومعمل الأجبان"
!define PRODUCT_VERSION "2.5.0"
!define PRODUCT_PUBLISHER "المهندس مالك حريبات - 0594345464"
!define PRODUCT_WEB_SITE "https://wa.me/972594345464"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\CheeseFactory.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

RequestExecutionLevel user

!include "MUI2.nsh"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "public/app_icon.ico"
!define MUI_UNICON "public/app_icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page: Option to run the application immediately
!define MUI_FINISHPAGE_RUN "$INSTDIR\CheeseFactory.exe"
!define MUI_FINISHPAGE_RUN_TEXT "تشغيل برنامج مصنع ومعمل الأجبان (.EXE) الآن"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\اقرأني_دليل_التشغيل_وكلمة_السر.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "عرض دليل التشغيل وكلمة المرور الافتراضية"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

; Setup Metadata
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "public/Setup_CheeseFactory.exe"
InstallDir "$LOCALAPPDATA\CheeseFactory"
InstallDirRegKey HKCU "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite on

  ; Copy native Windows executables (البرنامج نفسه كملف EXE)
  File "public/CheeseFactory.exe"
  File /oname=برنامج_مصنع_الأجبان.exe "public/CheeseFactory.exe"
  File "public/CustomerStatements.exe"
  File /oname=كشف_حسابات_الزبائن.exe "public/CustomerStatements.exe"

  ; Copy icons
  File "public/app_icon.ico"

  ; Copy core offline web applications
  File /oname=index.html "public/تشغيل_مصنع_الأجبان_المحمول.html"
  File /oname=كشف_حسابات_الزبائن.html "public/كشف_حسابات_الزبائن_للفلاشة.html"
  File "public/اقرأني_دليل_التشغيل_وكلمة_السر.txt"
  File "public/تشغيل_المصنع.bat"
  File "public/فتح_كشف_الزبائن.bat"
  File "public/تشغيل_صامت.vbs"

  ; Create database and backups folders
  CreateDirectory "$INSTDIR\database"
  CreateDirectory "$INSTDIR\backups"

  ; Copy initial database
  SetOutPath "$INSTDIR\database"
  File "public/dairy_database.json"

  ; Create Desktop Shortcuts directly pointing to the EXE program
  SetOutPath "$INSTDIR"
  CreateShortCut "$DESKTOP\مصنع ومعمل الأجبان.lnk" "$INSTDIR\CheeseFactory.exe" "" "$INSTDIR\app_icon.ico" 0 SW_SHOWNORMAL "" "برنامج مصنع ومعمل الأجبان - المهندس مالك حريبات 0594345464"
  CreateShortCut "$DESKTOP\كشف حسابات الزبائن.lnk" "$INSTDIR\CustomerStatements.exe" "" "$INSTDIR\app_icon.ico" 0 SW_SHOWNORMAL "" "برنامج كشف حسابات الزبائن والذمم للفلاشة"

  ; Create Start Menu Shortcuts
  CreateDirectory "$SMPROGRAMS\مصنع ومعمل الأجبان"
  CreateShortCut "$SMPROGRAMS\مصنع ومعمل الأجبان\مصنع ومعمل الأجبان.lnk" "$INSTDIR\CheeseFactory.exe" "" "$INSTDIR\app_icon.ico" 0 SW_SHOWNORMAL "" "تشغيل برنامج مصنع ومعمل الأجبان"
  CreateShortCut "$SMPROGRAMS\مصنع ومعمل الأجبان\كشف حسابات الزبائن.lnk" "$INSTDIR\CustomerStatements.exe" "" "$INSTDIR\app_icon.ico" 0 SW_SHOWNORMAL "" "كشف حسابات الزبائن والذمم"
  CreateShortCut "$SMPROGRAMS\مصنع ومعمل الأجبان\دليل التشغيل وكلمة السر.lnk" "$INSTDIR\اقرأني_دليل_التشغيل_وكلمة_السر.txt"
  CreateShortCut "$SMPROGRAMS\مصنع ومعمل الأجبان\مجلد قاعدة البيانات والملفات.lnk" "$INSTDIR"
  CreateShortCut "$SMPROGRAMS\مصنع ومعمل الأجبان\إلغاء تثبيت البرنامج.lnk" "$INSTDIR\uninstall.exe"

  ; Write uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"

  ; Write registry keys for Windows Add/Remove Programs
  WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\CheeseFactory.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\app_icon.ico"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

Section "Uninstall"
  ; Remove Desktop Shortcuts
  Delete "$DESKTOP\مصنع ومعمل الأجبان.lnk"
  Delete "$DESKTOP\كشف حسابات الزبائن.lnk"

  ; Remove Start Menu Shortcuts
  RMDir /r "$SMPROGRAMS\مصنع ومعمل الأجبان"

  ; Remove files
  Delete "$INSTDIR\CheeseFactory.exe"
  Delete "$INSTDIR\برنامج_مصنع_الأجبان.exe"
  Delete "$INSTDIR\CustomerStatements.exe"
  Delete "$INSTDIR\كشف_حسابات_الزبائن.exe"
  Delete "$INSTDIR\app_icon.ico"
  Delete "$INSTDIR\index.html"
  Delete "$INSTDIR\كشف_حسابات_الزبائن.html"
  Delete "$INSTDIR\اقرأني_دليل_التشغيل_وكلمة_السر.txt"
  Delete "$INSTDIR\تشغيل_المصنع.bat"
  Delete "$INSTDIR\فتح_كشف_الزبائن.bat"
  Delete "$INSTDIR\تشغيل_صامت.vbs"
  Delete "$INSTDIR\uninstall.exe"

  ; Remove directories
  RMDir "$INSTDIR\database"
  RMDir "$INSTDIR\backups"
  RMDir "$INSTDIR"

  ; Clean registry
  DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKCU "${PRODUCT_DIR_REGKEY}"

  SetAutoClose true
SectionEnd
