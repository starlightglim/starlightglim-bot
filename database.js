const Database = require('better-sqlite3');
const db = new Database('settings.db');

// Create table for server settings
db.prepare(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    disabled_channels TEXT DEFAULT '[]'
  )
`).run();

module.exports = db;