const fs = require("fs");
const os = require("os");
const path = require("path");

const CONFIG_PATH = path.join(os.homedir(), ".claude-ready.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Merges cloud-specific fields into the existing config without wiping Gmail creds.
function saveCloudConfig(fields) {
  const existing = loadConfig() || {};
  saveConfig({ ...existing, ...fields });
}

// Appends a schedule entry to config.schedules and persists.
function appendSchedule(entry) {
  const config = loadConfig() || {};
  const schedules = config.schedules || [];
  schedules.push(entry);
  saveConfig({ ...config, schedules });
}

module.exports = { loadConfig, saveConfig, saveCloudConfig, appendSchedule };
