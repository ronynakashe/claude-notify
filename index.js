#!/usr/bin/env node

const https = require("https");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const nodemailer = require("nodemailer");
const readline = require("readline");
const { loadConfig, saveConfig, saveCloudConfig, appendSchedule } = require("./config");

const KEYCHAIN_SERVICE = "Claude Code-credentials";
const ANTHROPIC_BETA = "oauth-2025-04-20";

// Hardcoded Worker endpoint — public on purpose; secrets live in the Worker.
const WORKER_BASE_URL = "https://api.claude-ready.com";

const args = process.argv.slice(2);

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// ─── Local Gmail setup ────────────────────────────────────────────────────────

async function runSetup() {
  console.log("🔧 Setting up Claude Ready...");
  console.log("⚠️ This is a terminal command, not a Claude command.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const email = await askQuestion(rl, "Your Gmail: ");
  const password = await askQuestion(rl, "Your Gmail App Password: ");

  rl.close();

  if (!email || !password) {
    console.log("❌ Setup failed. Email and App Password are required.");
    process.exit(1);
  }

  saveConfig({ ...(loadConfig() || {}), email, password });

  console.log("\n✅ Config saved.");
  console.log("📬 Run `claude-ready test` to send a test email.");
}

// ─── Cloud setup ──────────────────────────────────────────────────────────────

async function runCloudSetup() {
  console.log("☁️  Setting up Claude Ready cloud mode...");
  console.log("No Gmail password. No local waiting. Less clown behavior.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const cloudEmail = await askQuestion(rl, "Email to notify: ");

  rl.close();

  if (!cloudEmail) {
    console.log("❌ Setup failed. Email is required.");
    process.exit(1);
  }

  saveCloudConfig({
    cloudEmail,
    cloudApiUrl: undefined, // legacy field — no longer stored
    cloudEnabled: true,
  });

  console.log("\n✅ Cloud mode saved.");
  console.log(`📡 Schedules go through: ${WORKER_BASE_URL}`);
  console.log("📬 Run `claude-ready schedule` when Claude ghosts you.");
}

// ─── Claude token helpers ─────────────────────────────────────────────────────

function getTokenFromFile() {
  const configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  const credPath = path.join(configDir, ".credentials.json");
  try {
    const creds = JSON.parse(fs.readFileSync(credPath, "utf-8"));
    return creds?.claudeAiOauth?.accessToken || null;
  } catch {
    return null;
  }
}

function getTokenMac() {
  try {
    const username = process.env.USER || os.userInfo().username;
    const raw = execFileSync(
      "security",
      ["find-generic-password", "-a", username, "-w", "-s", KEYCHAIN_SERVICE],
      { encoding: "utf-8", timeout: 5000 }
    ).trim();
    const creds = JSON.parse(raw);
    return creds?.claudeAiOauth?.accessToken || null;
  } catch {
    return null;
  }
}

function getClaudeToken() {
  const token = getTokenFromFile() ?? (process.platform === "darwin" ? getTokenMac() : null);

  if (token) return token;

  const configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  console.error("❌ Couldn't find your Claude token.");
  console.error(`Looked in: ${path.join(configDir, ".credentials.json")}`);
  if (process.platform === "darwin") {
    console.error(`         : macOS Keychain (${KEYCHAIN_SERVICE})`);
  }
  console.error("Make sure you are logged in to Claude Code and have run it at least once.");
  process.exit(1);
}

// ─── Claude usage API ─────────────────────────────────────────────────────────

function fetchClaudeUsage(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.anthropic.com",
      path: "/api/oauth/usage",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "anthropic-beta": ANTHROPIC_BETA,
      },
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Couldn't parse Claude usage response."));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request to Claude timed out."));
    });
    req.end();
  });
}

function parseResetTime(value) {
  if (!value) return null;

  if (typeof value === "number") {
    return value * 1000;
  }

  if (typeof value === "string") {
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) {
      return asNumber * 1000;
    }

    const asDate = new Date(value).getTime();
    return Number.isNaN(asDate) ? null : asDate;
  }

  return null;
}

function formatMinutes(ms) {
  const totalMinutes = Math.ceil(ms / 60000);

  if (totalMinutes <= 1) return "about 1 minute";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// ─── Local Gmail send ─────────────────────────────────────────────────────────

function createTransporter(config) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email,
      pass: config.password,
    },
  });
}

async function sendEmail(config, resetDate, isTest = false) {
  const transporter = createTransporter(config);

  const subject = isTest
    ? "🧪 Claude Ready test email"
    : "🚀 Claude is back. Stop pretending to rest.";

  const text = isTest
    ? "Test email sent. If you got this, the setup works."
    : `Claude is ready again.

Your excuse is gone.
Go back to coding.

Reset time: ${resetDate.toLocaleString()}`;

  await transporter.sendMail({
    from: config.email,
    to: config.email,
    subject,
    text,
  });
}

async function runTest(config) {
  console.log("🧪 Sending test email...");
  await sendEmail(config, new Date(), true);
  console.log("✅ Test email sent. If you didn't get it, blame Gmail first.");
}

// ─── Local notify (original mode) ────────────────────────────────────────────

async function runNotify(config) {
  console.log("🔍 Checking if you broke Claude again...");

  const token = getClaudeToken();
  const usage = await fetchClaudeUsage(token);
  const fiveHour = usage?.five_hour;

  if (!fiveHour || fiveHour.utilization < 100) {
    console.log("✅ Claude isn't blocked. Go code.");
    return;
  }

  const resetMs = parseResetTime(fiveHour.resets_at);

  if (!resetMs) {
    console.log("⚠️ Limit hit but no reset time found. Anthropic may have changed something.");
    return;
  }

  const resetDate = new Date(resetMs);
  const delay = resetMs - Date.now();

  if (delay <= 0) {
    console.log("✅ Claude looks ready already. Sending email now anyway, because drama.");
    await sendEmail(config, resetDate);
    console.log("📧 Email sent.");
    return;
  }

  console.log("💀 Yep. You're cooked. Claude is out.");
  console.log(`⏱ Claude should be back in ${formatMinutes(delay)}.`);
  console.log("📬 I'll email you when it's back. Try touching grass.");

  setTimeout(async () => {
    try {
      await sendEmail(config, resetDate);
      console.log("📧 Email sent. Claude is back. No more excuses.");
      process.exit(0);
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
      process.exit(1);
    }
  }, delay);
}

// ─── Cloud schedule ───────────────────────────────────────────────────────────

function postToWorker(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsed = new URL(url);

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
      timeout: 10000,
    };

    const mod = parsed.protocol === "https:" ? https : require("http");
    const req = mod.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid response from scheduling API."));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Scheduling API timed out."));
    });

    req.write(body);
    req.end();
  });
}

async function runSchedule(config) {
  console.log("🔍 Checking if Claude rage-quit on you again...");

  const token = getClaudeToken();
  const usage = await fetchClaudeUsage(token);
  const fiveHour = usage?.five_hour;

  if (!fiveHour || fiveHour.utilization < 100) {
    console.log("✅ Claude isn't blocked. Nothing to schedule.");
    return;
  }

  const resetMs = parseResetTime(fiveHour.resets_at);

  if (!resetMs) {
    console.log("⚠️ Limit hit but no reset time found. Anthropic may have changed something.");
    return;
  }

  const delay = resetMs - Date.now();
  const sendAt = new Date(resetMs).toISOString();

  console.log(`💀 Yep. Limit detected. Claude should be back in ${formatMinutes(delay)}.`);
  console.log("☁️  Scheduling email in the cloud...");

  const endpoint = `${WORKER_BASE_URL}/schedule-email`;
  let result;

  try {
    result = await postToWorker(endpoint, {
      email: config.cloudEmail,
      sendAt,
    });
  } catch (err) {
    console.error("❌ Failed to reach the scheduling API:", err.message);
    process.exit(1);
  }

  if (!result.ok) {
    console.error("❌ Scheduling failed:", result.error);
    process.exit(1);
  }

  // Save to local history
  appendSchedule({
    email: config.cloudEmail,
    sendAt,
    createdAt: new Date().toISOString(),
    status: "scheduled",
    brevoMessageId: result.brevoMessageId ?? null,
  });

  const sendAtFormatted = new Date(sendAt).toLocaleString();
  console.log("📬 Scheduled. You can close your laptop now. I'll do the annoying part.");
  console.log(`⏱  Sends at: ${sendAtFormatted}`);
}

// ─── View local schedule history ──────────────────────────────────────────────

function runShowScheduled(config) {
  const schedules = config?.schedules;

  if (!schedules || schedules.length === 0) {
    console.log("📭 Nothing scheduled locally. Run `claude-ready schedule` first.");
    return;
  }

  console.log("📬 Scheduled emails saved locally:\n");

  schedules.forEach((entry, i) => {
    const sendAtMs = new Date(entry.sendAt).getTime();
    const now = Date.now();
    const diff = sendAtMs - now;
    const timeLabel =
      diff > 0 ? `In: ${formatMinutes(diff)}` : "Already sent (or past due)";

    console.log(`${i + 1}. Claude Ready email`);
    console.log(`   Status: ${entry.status}`);
    console.log(`   To: ${entry.email}`);
    console.log(`   Sends at: ${new Date(entry.sendAt).toLocaleString()}`);
    console.log(`   ${timeLabel}`);
    if (entry.brevoMessageId) {
      console.log(`   Brevo message: ${entry.brevoMessageId}`);
    }
    console.log();
  });

  console.log("ℹ️  This is local history only. Claude Ready does not store schedules on its servers.");
}

// ─── Clear local schedule history ────────────────────────────────────────────

function runClearScheduled(config) {
  saveCloudConfig({ schedules: [] });
  console.log("🧹 Cleared local schedule history. The crime scene is clean.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (args[0] === "cloud" && args[1] === "setup") {
    await runCloudSetup();
    return;
  }

  if (args[0] === "setup") {
    await runSetup();
    return;
  }

  if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Claude Ready - Get emailed when Claude is ready again

⚠️ This is a terminal command, not a Claude command.

Local mode (terminal must stay open):
  claude-ready             Email you when Claude is ready again
  claude-ready setup       Configure Gmail credentials
  claude-ready test        Send a test email

Cloud mode (close your laptop, still get the email):
  claude-ready cloud setup    Configure cloud email
  claude-ready schedule       Schedule a cloud notification and exit
  claude-ready scheduled      View locally saved schedule history
  claude-ready clear-scheduled  Clear local schedule history

General:
  claude-ready --help      Show this help
`);
    return;
  }

  const config = loadConfig();

  if (args[0] === "schedule") {
    if (!config?.cloudEnabled || !config?.cloudEmail) {
      console.log("❌ Cloud mode not configured. Run `claude-ready cloud setup` first.");
      process.exit(1);
    }
    await runSchedule(config);
    return;
  }

  if (args[0] === "scheduled") {
    runShowScheduled(config);
    return;
  }

  if (args[0] === "clear-scheduled") {
    if (!config) {
      console.log("❌ No config found. Nothing to clear.");
      return;
    }
    runClearScheduled(config);
    return;
  }

  if (!config) {
    console.log("❌ Run `claude-ready setup` first.");
    return;
  }

  if (args[0] === "test") {
    await runTest(config);
    return;
  }

  await runNotify(config);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
