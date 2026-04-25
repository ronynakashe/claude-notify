# 🚀 Claude Notify

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
claude-notify
```

Then go live your life.

We’ll email you when Claude is usable again.

---

## ⚡ Install

```bash
npm install -g claude-notify
```

👉 After installing, run it from your terminal:

```bash
claude-notify
```

❌ Not inside Claude
❌ Not in chat
✅ In your terminal (same place you run `git`, `npm`, etc.)

---

## 🔐 Setup (1 minute)

Claude Notify uses **your own Gmail account** to send you notifications.

### Step 1 — Enable 2FA

Go to your Google Account → Security → enable 2-Step Verification

### Step 2 — Create App Password

Search for **App Passwords** → generate one for "Mail"

### Step 3 — Run setup

```bash
claude-notify setup
```

Enter:

* your Gmail
* your App Password

Your credentials are stored locally on your machine:

```bash
~/.claude-notify.json
```

---

## 🧠 Usage

When Claude blocks you:

👉 Open your terminal and run:

```bash
claude-notify
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
claude-notify           # schedule notification
claude-notify setup     # configure email
claude-notify test      # send test email
claude-notify --help    # show help
```

---

## ⚠️ Important

* Your laptop must stay on (for now)
* This is a local tool (no backend yet)
* Your Gmail credentials never leave your machine

---

## ⚠️ Common Mistake

> “I typed `claude-notify` inside Claude and nothing happened”

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

---

## 😈 Why this exists

Because this is not a workflow:

```
refresh → refresh → refresh → refresh
```

---

## 🚀 Roadmap

* background mode (no terminal needed)
* Telegram notifications
* hosted mode (no Gmail setup)
* smarter detection

---

## 🤝 Contributing

PRs welcome. Keep it simple.

---

## ⭐ Support

If this saved you from refreshing Claude like a clown:

👉 Star the repo
