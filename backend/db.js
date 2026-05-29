const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'amboul.db');

let _db = null;

async function getDb() {
    if (_db) return _db;
    _db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
    await _db.exec('PRAGMA journal_mode = WAL');
    await _db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    return _db;
}

module.exports = { getDb };
