import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 开发模式下模块会被热重载,用 globalThis 缓存连接,避免重复打开数据库
const globalForDb = globalThis as unknown as { _foodDb?: Database.Database };

export const db =
  globalForDb._foodDb ?? new Database(path.join(dataDir, "app.db"));

if (!globalForDb._foodDb) {
  globalForDb._foodDb = db;
}

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    restaurant TEXT,
    price REAL,
    photo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

export type Entry = {
  id: number;
  name: string;
  restaurant: string | null;
  price: number | null;
  photo: string | null;
  created_at: string;
};

export function getEntries(): Entry[] {
  return db
    .prepare("SELECT * FROM entries ORDER BY created_at DESC, id DESC")
    .all() as Entry[];
}

export function createEntry(data: {
  name: string;
  restaurant: string | null;
  price: number | null;
  photo: string | null;
}): Entry {
  const result = db
    .prepare(
      "INSERT INTO entries (name, restaurant, price, photo) VALUES (@name, @restaurant, @price, @photo)"
    )
    .run(data);
  return db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .get(result.lastInsertRowid) as Entry;
}
