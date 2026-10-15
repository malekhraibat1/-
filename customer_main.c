#include <windows.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>
#include <shlobj.h>
#include "embedded_stmt.h"

static BOOL FileExistsW(LPCWSTR szPath) {
    DWORD dwAttrib = GetFileAttributesW(szPath);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

static BOOL DirExistsW(LPCWSTR szPath) {
    DWORD dwAttrib = GetFileAttributesW(szPath);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    WCHAR exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    WCHAR* lastSlash = wcsrchr(exePath, L'\\');
    if (lastSlash) *lastSlash = L'\0';

    WCHAR targetHtml[MAX_PATH];
    wsprintfW(targetHtml, L"%s\\كشف_حسابات_الزبائن.html", exePath);

    if (!FileExistsW(targetHtml)) {
        wsprintfW(targetHtml, L"%s\\كشف_حسابات_الزبائن_للفلاشة.html", exePath);
    }

    if (!FileExistsW(targetHtml)) {
        WCHAR localAppData[MAX_PATH];
        if (SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_LOCAL_APPDATA, NULL, 0, localAppData))) {
            WCHAR cheeseDir[MAX_PATH];
            wsprintfW(cheeseDir, L"%s\\CheeseFactory", localAppData);
            if (!DirExistsW(cheeseDir)) {
                CreateDirectoryW(cheeseDir, NULL);
            }

            wsprintfW(targetHtml, L"%s\\CheeseFactory\\كشف_حسابات_الزبائن.html", localAppData);
            if (!FileExistsW(targetHtml)) {
                HANDLE hFile = CreateFileW(targetHtml, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
                if (hFile != INVALID_HANDLE_VALUE) {
                    DWORD written = 0;
                    WriteFile(hFile, embedded_stmt, embedded_stmt_len, &written, NULL);
                    CloseHandle(hFile);
                }
            }
        }
    }

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

    if (!launched) {
        ShellExecuteW(NULL, L"open", targetHtml, NULL, NULL, SW_SHOWNORMAL);
    }

    return 0;
}
