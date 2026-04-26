# Feature Implementation Plan

**Overall Progress:** `100%`

## TLDR
Add Windows support by replacing the macOS-only `security` CLI call with a platform-aware token reader. On Windows, Claude Code stores OAuth credentials in Windows Credential Manager under the same service name — readable via PowerShell's WinRT `PasswordVault` API. Everything else in the codebase is already cross-platform.

## Critical Decisions
- **Windows credential method: PowerShell WinRT PasswordVault** — no new npm dependencies; available on all Windows 10+ machines; mirrors exactly what `keytar` (Claude Code's underlying lib) uses internally.
- **Scope: Windows + macOS only** — Linux not requested; adding it would require a third code path (libsecret) with no confirmed test surface.
- **No refactor beyond token retrieval** — `process.env.USERNAME` (Windows) vs `process.env.USER` (macOS) is only used in the macOS path, so no change needed there.

## Tasks

- [x] 🟩 **Step 1: Make `getClaudeToken()` platform-aware**
  - [x] 🟩 Split into `getTokenMac()` (existing logic) and `getTokenWindows()` (new)
  - [x] 🟩 In `getTokenWindows()`, use `execFileSync('powershell', [...])` to query Windows Credential Manager via inline C# (CredRead API) and parse `claudeAiOauth.accessToken` from the result
  - [x] 🟩 Route based on `process.platform === 'win32'` vs `'darwin'`; exit with a clear message for any other platform

- [x] 🟩 **Step 2: Update error messages**
  - [x] 🟩 `getTokenMac()` keeps its existing macOS-specific error text
  - [x] 🟩 `getTokenWindows()` prints a Windows-specific error ("Make sure you are logged in to Claude Code on this Windows machine")
  - [x] 🟩 Top-level unsupported-platform error names the platform and says only macOS and Windows are supported

- [x] 🟩 **Step 3: Update README**
  - [x] 🟩 Remove "macOS only" from the Limitations section; replace with the actual constraint (Windows 10+ and macOS supported; Linux not yet)
  - [x] 🟩 Add a brief Windows setup note (no extra steps needed beyond the existing Gmail App Password flow)
