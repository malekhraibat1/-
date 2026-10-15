#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>
#include <shlobj.h>
#include "embedded_html.h"
#include "embedded_db.h"

static BOOL FileExistsW(LPCWSTR szPath) {
    DWORD dwAttrib = GetFileAttributesW(szPath);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

static BOOL DirExistsW(LPCWSTR szPath) {
    DWORD dwAttrib = GetFileAttributesW(szPath);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    // 1. Get directory where CheeseFactory.exe is located
    WCHAR exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    WCHAR* lastSlash = wcsrchr(exePath, L'\\');
    if (lastSlash) *lastSlash = L'\0';

    // 2. Check for local HTML file
    WCHAR targetHtml[MAX_PATH];
    wsprintfW(targetHtml, L"%s\\index.html", exePath);

    if (!FileExistsW(targetHtml)) {
        wsprintfW(targetHtml, L"%s\\تشغيل_مصنع_الأجبان_المحمول.html", exePath);
    }

    // 3. If not found in current folder, extract into %LOCALAPPDATA%\CheeseFactory
    if (!FileExistsW(targetHtml)) {
        WCHAR localAppData[MAX_PATH];
        if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, localAppData))) {
            WCHAR cheeseDir[MAX_PATH];
            wsprintfW(cheeseDir, L"%s\\CheeseFactory", localAppData);
            if (!DirExistsW(cheeseDir)) {
                CreateDirectoryW(cheeseDir, NULL);
            }

            WCHAR dbDir[MAX_PATH];
            wsprintfW(dbDir, L"%s\\CheeseFactory\\database", localAppData);
            if (!DirExistsW(dbDir)) {
                CreateDirectoryW(dbDir, NULL);
            }

            wsprintfW(targetHtml, L"%s\\CheeseFactory\\index.html", localAppData);
            if (!FileExistsW(targetHtml)) {
                HANDLE hFile = CreateFileW(targetHtml, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
                if (hFile != INVALID_HANDLE_VALUE) {
                    DWORD written = 0;
                    WriteFile(hFile, embedded_html, embedded_html_len, &written, NULL);
                    CloseHandle(hFile);
                }
            }

            WCHAR dbFile[MAX_PATH];
            wsprintfW(dbFile, L"%s\\CheeseFactory\\database\\dairy_database.json", localAppData);
            if (!FileExistsW(dbFile)) {
                HANDLE hFile = CreateFileW(dbFile, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
                if (hFile != INVALID_HANDLE_VALUE) {
                    DWORD written = 0;
                    WriteFile(hFile, embedded_db, embedded_db_len, &written, NULL);
                    CloseHandle(hFile);
                }
            }
        }
    }

    // 4. Look for Chrome or Edge to launch in desktop app mode (--app)
    WCHAR browserCmd[2048] = {0};

    LPCWSTR candidates[] = {
        L"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        L"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        L"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        L"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        NULL
    };

    BOOL launched = FALSE;
    for (int i = 0; candidates[i] != NULL; i++) {
        if (FileExistsW(candidates[i])) {
            wsprintfW(browserCmd, L"\"%s\" --app=\"file:///%s\"", candidates[i], targetHtml);

            STARTUPINFOW si;
            PROCESS_INFORMATION pi;
            ZeroMemory(&si, sizeof(si));
            si.cb = sizeof(si);
            ZeroMemory(&pi, sizeof(pi));

            if (CreateProcessW(NULL, browserCmd, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
                CloseHandle(pi.hProcess);
                CloseHandle(pi.hThread);
                launched = TRUE;
                break;
            }
        }
    }

    // 5. Fallback: Open with default browser
    if (!launched) {
        ShellExecuteW(NULL, L"open", targetHtml, NULL, NULL, SW_SHOWNORMAL);
    }

    return 0;
}
