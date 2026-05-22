import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { runSchema } from './schema';
import { runSeed } from './seed';

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pinili_cutlet.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema and seed data
runSchema(db);
runSeed(db);

export default db;
