# 🚀 Claude Ready

[![npm version](https://img.shields.io/npm/v/claude-ready.svg)](https://www.npmjs.com/package/claude-ready)
[![npm downloads](https://img.shields.io/npm/dw/claude-ready.svg)](https://www.npmjs.com/package/claude-ready)
[![license](https://img.shields.io/npm/l/claude-ready.svg)](https://github.com/ronynakashe/claude-ready/blob/main/LICENSE)

> ⚠️ **This is a terminal (CLI) tool — NOT a Claude command**
> You run it in your terminal, not inside Claude.

---

## 💀 The Problem

You hit Claude’s limit.

Now you:

* refresh like a maniac
* stare at the screen
* pretend you’re being productive

---

## ✅ The Solution

Run one command:

```bash
claude-ready
```

Then go live your life.

We’ll email you when Claude is usable again.

---

## ⚡ Install

```bash
npm install -g claude-ready
```

👉 After installing and setup, run it from your terminal:

```bash
claude-ready
```

❌ Not inside Claude
❌ Not in chat
✅ In your terminal (same place you run `git`, `npm`, etc.)

---

## 🔐 Setup (1 minute)

Claude Ready uses **your own Gmail account** to send you notifications.

### Step 1 — Enable 2FA

Go to your Google Account → Security → enable 2-Step Verification

### Step 2 — Create App Password

Search for **App Passwords** → generate one for "Mail"

### Step 3 — Run setup

```bash
claude-ready setup
```

Enter:

* your Gmail
* your App Password

Your credentials are stored locally on your machine:

```bash
~/.claude-ready.json
```

---

## 🧠 Usage

When Claude blocks you:

👉 Open your terminal and run:

```bash
claude-ready
```

Example output:

```text
🔍 Checking if you broke Claude again...
💀 Yep. You’re cooked. Claude is out.
⏱ Claude should be back in ~1h 20m.
📬 I’ll email you when it’s back. Try touching grass.
```

Then leave your computer.

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

```bash
claude-ready           # schedule notification
claude-ready setup     # configure email
claude-ready test      # send test email
claude-ready --help    # show help
```

---

## 🖥️ Platform Support

| Platform | Status | How it works |
|----------|--------|-------------|
| macOS | ✅ Supported | Reads `~/.claude/.credentials.json`, falls back to macOS Keychain |
| Windows 10+ | ✅ Supported | Reads `~/.claude/.credentials.json` |
| Linux | ❌ Not yet supported | — |

## 🚧 Limitations

- Gmail only for now
- Claude Code only
- Your laptop must stay awake until the email is sent

---

## ⚠️ Common Mistake

> “I typed `claude-ready` inside Claude and nothing happened”

Yeah… that won’t work 😄

👉 This is a **terminal command**, not a Claude feature.

---

## 🧪 Troubleshooting

### ❌ Couldn’t fetch Claude usage

* Make sure you’re logged into Claude Code
* Run Claude at least once before using this tool

### ❌ No reset time found

* You haven’t hit the limit yet
* Or Claude changed something (open an issue)

### ❌ Couldn’t find your Claude token (Windows)

Claude Ready reads your token from `~/.claude/.credentials.json` — a file Claude Code creates automatically when you log in.

* Make sure you’ve installed and logged into **Claude Code** (the CLI), not just the Claude web app
* Run `claude` at least once so it can write the credentials file
* Check the file exists: `%USERPROFILE%\.claude\.credentials.json`

---

## 😈 Why this exists

Because this is not a workflow:

```
- leave your computer
- come back to check
- see it’s still blocked
- leave again
- repeat like a clown
```

---

## 🚀 Roadmap

* background mode (no terminal needed)
* Telegram notifications
* hosted mode (no Gmail setup)
* smarter detection

---

## 🔒 Privacy & Security

Claude Ready is local-first.

- Your Gmail credentials are stored only on your machine
- Nothing is sent to a backend
- The tool reads your local Claude Code credentials from `~/.claude/.credentials.json` (written by Claude Code itself), with a macOS Keychain fallback on Mac
- You can delete the config anytime:

```bash
rm ~/.claude-ready.json
```

---

## 📋 Release Notes

### v1.1.0
- **Fixed Windows support** — Claude Code actually stores its token in `~/.claude/.credentials.json` on all platforms. The tool now reads that file directly, making Windows work reliably with no extra setup.
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
