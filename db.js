const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'subscriptions.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        category TEXT NOT NULL,
        recurrence TEXT NOT NULL,
        paid INTEGER NOT NULL DEFAULT 0
        )
`);

module.exports = db;