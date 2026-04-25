#!/usr/bin/env node

const https = require("https");
const { execFileSync } = require("child_process");
const os = require("os");
const nodemailer = require("nodemailer");
const readline = require("readline");
const { loadConfig, saveConfig } = require("./config");

const KEYCHAIN_SERVICE = "Claude Code-credentials";
const ANTHROPIC_BETA = "oauth-2025-04-20";

const args = process.argv.slice(2);

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

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

  saveConfig({ email, password });

  console.log("\n✅ Config saved.");
  console.log("📬 Run `claude-ready test` to send a test email.");
}

function getClaudeToken() {
  try {
    const username = process.env.USER || os.userInfo().username;

    const raw = execFileSync(
      "security",
      ["find-generic-password", "-a", username, "-w", "-s", KEYCHAIN_SERVICE],
      { encoding: "utf-8", timeout: 5000 }
    ).trim();

    const creds = JSON.parse(raw);
    return creds?.claudeAiOauth?.accessToken;
  } catch (error) {
    console.error("❌ Couldn’t read Claude token from macOS Keychain.");
    console.error("Make sure you are logged in to Claude Code on this Mac.");
    process.exit(1);
  }
}

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

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error("Couldn’t parse Claude usage response."));
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

  console.log("✅ Test email sent. If you didn’t get it, blame Gmail first.");
}

async function runNotify(config) {
  console.log("🔍 Checking if you broke Claude again...");

  const token = getClaudeToken();
  const usage = await fetchClaudeUsage(token);

  const resetMs = parseResetTime(usage?.five_hour?.resets_at);

  if (!resetMs) {
    console.log("⚠️ No reset time found.");
    console.log("Either Claude is usable, or Anthropic changed something to ruin our fun.");
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

  console.log("💀 Yep. You’re cooked. Claude is out.");
  console.log(`⏱ Claude should be back in ${formatMinutes(delay)}.`);
  console.log("📬 I’ll email you when it’s back. Try touching grass.");

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

async function main() {
  if (args[0] === "setup") {
    await runSetup();
    return;
  }

  if (args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Claude Ready - Get emailed when Claude is ready again

⚠️ This is a terminal command, not a Claude command.

Usage:
  claude-ready setup   Configure Gmail
  claude-ready test    Send test email
  claude-ready         Email you when Claude is ready again
`);
    return;
  }

  const config = loadConfig();

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