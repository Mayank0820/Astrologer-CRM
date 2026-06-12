const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'astrologer_crm.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    specializations TEXT DEFAULT '[]',
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender TEXT,
    date_of_birth TEXT,
    time_of_birth TEXT,
    place_of_birth TEXT,
    latitude REAL,
    longitude REAL,
    zodiac_sign TEXT,
    nakshatra TEXT,
    notes TEXT,
    profile_image TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    price REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    icon TEXT DEFAULT 'star',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    service_id TEXT,
    type TEXT NOT NULL DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_at TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    notes TEXT,
    summary TEXT,
    amount REAL DEFAULT 0,
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'completed',
    notes TEXT,
    paid_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
  CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
  CREATE INDEX IF NOT EXISTS idx_consultations_client_id ON consultations(client_id);
  CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
  CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_at ON consultations(scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_payments_consultation_id ON payments(consultation_id);
`);

module.exports = db;
