# 🚀 Claude Ready

[![npm version](https://img.shields.io/npm/v/claude-ready.svg)](https://www.npmjs.com/package/claude-ready)
[![npm downloads](https://img.shields.io/npm/dw/claude-ready.svg)](https://www.npmjs.com/package/claude-ready)
[![license](https://img.shields.io/npm/l/claude-ready.svg)](https://github.com/ronynakashe/claude-ready/blob/main/LICENSE)

> ⚠️ **This is a terminal (CLI) tool — NOT a Claude command**
> You run it in your terminal, not inside Claude.

---

## 💀 The Problem

You hit Claude's limit.

Now you:

* refresh like a maniac
* stare at the screen
* pretend you're being productive

---

## ✅ The Solution

Run one command, close your laptop, get an email when Claude is back.

**No Gmail setup. No open terminal. No waiting.**

```bash
claude-ready schedule
```

---

## ⚡ Install

```bash
npm install -g claude-ready
```

---

## ☁️ Quick Start — Cloud Mode

No Gmail password. No open terminal. Just your email.

### Step 1 — One-time setup

```bash
claude-ready cloud setup
```

Enter your email address. That's it.

### Step 2 — Schedule when Claude blocks you

```bash
claude-ready schedule
```

Example output:

```text
🔍 Checking if Claude rage-quit on you again...
💀 Yep. Limit detected. Claude should be back in 1h 20m.
☁️  Scheduling email in the cloud...
📬 Scheduled. You can close your laptop now. I'll do the annoying part.
⏱  Sends at: 4/29/2026, 5:30:00 PM
```

Close your laptop. The email arrives at the exact reset time — delivered by Brevo, scheduled by our Cloudflare Worker.

---

## 📬 Email Example

**Subject:**

```
🚀 Claude is back. Stop pretending to rest.
```

**Body:**

```
Claude is ready again.

Your excuse is gone.
Go back to coding.
```

---

## 🧪 Commands

### Cloud mode

```bash
claude-ready cloud setup      # one-time: save your email
claude-ready schedule         # schedule a cloud notification, then exit
claude-ready scheduled        # view locally saved schedule history
claude-ready clear-scheduled  # clear local schedule history
```

### Local mode (terminal must stay open)

```bash
claude-ready             # wait locally, email when Claude is back
claude-ready setup       # configure Gmail credentials
claude-ready test        # send a test email
```

### General

```bash
claude-ready --help      # show help
```

---

## 🖥️ Local Mode — Existing Users

Already set up with Gmail? Nothing changes. `claude-ready` still works exactly as before.

Local mode keeps your terminal open and sends the email directly from your Gmail when the reset fires.

### Setup

```bash
claude-ready setup
```

Requires a Gmail account with 2FA enabled and an [App Password](https://myaccount.google.com/apppasswords) generated for "Mail".

Your credentials are stored locally on your machine:

```
~/.claude-ready.json
```

---

## 🖥️ Platform Support

| Platform | Status | How it works |
|----------|--------|-------------|
| macOS | ✅ Supported | Reads `~/.claude/.credentials.json`, falls back to macOS Keychain |
| Windows 10+ | ✅ Supported | Reads `~/.claude/.credentials.json` |
| Linux | ❌ Not yet supported | — |

---

## 🚧 Limitations

### Cloud mode
- Scheduled history is stored locally only — `claude-ready scheduled` shows local history, not live Brevo status
- Cancellation is not supported yet
- Email delivery only
- Schedules must be within the next 12 hours (matches Claude's reset windows)

### Local mode
- Gmail only
- Claude Code only
- Your laptop must stay awake until the email is sent

---

## ⚠️ Common Mistake

> "I typed `claude-ready` inside Claude and nothing happened"

Yeah… that won't work 😄

👉 This is a **terminal command**, not a Claude feature.

---

## 🧪 Troubleshooting

### ❌ Couldn't fetch Claude usage

* Make sure you're logged into Claude Code
* Run Claude at least once before using this tool

### ❌ No reset time found

* You haven't hit the limit yet
* Or Claude changed something (open an issue)

### ❌ Couldn't find your Claude token (Windows)

Claude Ready reads your token from `~/.claude/.credentials.json` — a file Claude Code creates automatically when you log in.

* Make sure you've installed and logged into **Claude Code** (the CLI), not just the Claude web app
* Run `claude` at least once so it can write the credentials file
* Check the file exists: `%USERPROFILE%\.claude\.credentials.json`

---

## 😈 Why this exists

Because this is not a workflow:

```
- leave your computer
- come back to check
- see it's still blocked
- leave again
- repeat like a clown
```

---

## 🚀 Roadmap

* Telegram notifications
* Smarter detection
* Linux support

---

## 🔒 Privacy & Security

- **Cloud mode**: your email address and Claude's reset time are sent to our Cloudflare Worker (`api.claude-ready.com`) and forwarded to Brevo for scheduled delivery. Nothing else is stored server-side.
- **Local mode**: your Gmail credentials stay only on your machine. Nothing is sent to any backend.
- The tool reads your Claude token from `~/.claude/.credentials.json` (written by Claude Code itself), with a macOS Keychain fallback on Mac.
- Delete all local config anytime:

```bash
rm ~/.claude-ready.json
```

---

## 📋 Release Notes

### v2.0.0
- **Cloud mode** — close your laptop and still get the email. No Gmail setup, no open terminal. Run `claude-ready cloud setup` once, then `claude-ready schedule` whenever Claude blocks you.
- Scheduling is handled by a hardened Cloudflare Worker (`api.claude-ready.com`) backed by Brevo's scheduled email delivery.
- The Worker enforces strict abuse protection: IP rate limiting, 1 KB payload cap, fixed server-side email content, 12-hour schedule window, and no CORS — it cannot be used as a general email API.
- New commands: `cloud setup`, `schedule`, `scheduled`, `clear-scheduled`.

### v1.1.0
- **Fixed Windows support** — Claude Code stores its token in `~/.claude/.credentials.json` on all platforms. The tool now reads that file directly, making Windows work reliably with no extra setup.
- Simplified credential logic: one file-based path for all platforms, macOS Keychain as a fallback on Mac only.
- Improved error messages — when the token can't be found, the error now shows the exact file path that was checked.

### v1.0.1
- Initial release — macOS only

---

## 🤝 Contributing

PRs welcome. Keep it simple.

---

## ⭐ Support

If this saved you from refreshing Claude like a clown:

👉 Star the repo
