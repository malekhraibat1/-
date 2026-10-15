' تشغيل صامت لبرنامج مصنع الأجبان من الفلاشة بدون ظهور الشاشة السوداء
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "تشغيل_برنامج_الجبنة_من_الفلاشة.bat" & Chr(34), 0
Set WshShell = Nothing
