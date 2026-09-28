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

// 版本化迁移:每个版本独立事务、各自 bump user_version,幂等
const SCHEMA_VERSION = 3;

const migrations: Record<number, () => void> = {
  // v1:评分 / 推荐等级 / 地址 / 浏览量 / 隐藏 + photos 表,并回填旧封面
  1: () => {
    db.exec(`
      ALTER TABLE entries ADD COLUMN rating INTEGER;
      ALTER TABLE entries ADD COLUMN recommend TEXT;
      ALTER TABLE entries ADD COLUMN address TEXT;
      ALTER TABLE entries ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE entries ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL REFERENCES entries(id),
        path TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_photos_entry ON photos(entry_id);
    `);
    db.prepare(
      `INSERT INTO photos (entry_id, path, sort_order)
       SELECT id, photo, 0 FROM entries
       WHERE photo IS NOT NULL AND TRIM(photo) <> ''`
    ).run();
  },
  // v2:用户 / 会话 / 帖子作者
  2: () => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      ALTER TABLE entries ADD COLUMN author_id INTEGER REFERENCES users(id);
      CREATE INDEX IF NOT EXISTS idx_entries_author ON entries(author_id);
    `);
  },
  // v3:帖子描述(可选)
  3: () => {
    db.exec(`ALTER TABLE entries ADD COLUMN description TEXT;`);
  },
};

function migrate() {
  const current = db.pragma("user_version", { simple: true }) as number;
  if (current >= SCHEMA_VERSION) return;
  for (let v = current + 1; v <= SCHEMA_VERSION; v++) {
    db.transaction(() => {
      migrations[v]();
      db.pragma(`user_version = ${v}`);
    })();
  }
}

migrate();

export type Photo = {
  id: number;
  entry_id: number;
  path: string;
  sort_order: number;
};

export type Entry = {
  id: number;
  name: string;
  restaurant: string | null;
  price: number | null;
  photo: string | null; // 封面,发布时写入,之后不再变
  rating: number | null;
  recommend: string | null;
  address: string | null;
  description: string | null;
  views: number;
  hidden: number;
  created_at: string;
  author_id: number | null;
  author_name: string | null;
};

export type EntryWithPhotos = Entry & { photos: Photo[] };

export function getEntries(options: { hiddenOnly?: boolean } = {}): Entry[] {
  return db
    .prepare(
      `SELECT e.*, u.username AS author_name
       FROM entries e
       LEFT JOIN users u ON u.id = e.author_id
       WHERE e.hidden = ?
       ORDER BY e.created_at DESC, e.id DESC`
    )
    .all(options.hiddenOnly ? 1 : 0) as Entry[];
}

export function getEntryById(id: number): EntryWithPhotos | null {
  const entry = db
    .prepare(
      `SELECT e.*, u.username AS author_name
       FROM entries e
       LEFT JOIN users u ON u.id = e.author_id
       WHERE e.id = ?`
    )
    .get(id) as Entry | undefined;
  if (!entry) return null;
  const photos = db
    .prepare("SELECT * FROM photos WHERE entry_id = ? ORDER BY sort_order, id")
    .all(id) as Photo[];
  return { ...entry, photos };
}

export function createEntry(data: {
  name: string;
  restaurant: string | null;
  price: number | null;
  photos: string[];
  rating: number | null;
  recommend: string | null;
  address: string | null;
  description: string | null;
  authorId: number;
}): EntryWithPhotos {
  const entryId = db.transaction(() => {
    const cover = data.photos[0] ?? null;
    const info = db
      .prepare(
        `INSERT INTO entries (name, restaurant, price, photo, rating, recommend, address, description, author_id)
         VALUES (@name, @restaurant, @price, @photo, @rating, @recommend, @address, @description, @authorId)`
      )
      .run({
        name: data.name,
        restaurant: data.restaurant,
        price: data.price,
        photo: cover,
        rating: data.rating,
        recommend: data.recommend,
        address: data.address,
        description: data.description,
        authorId: data.authorId,
      });
    const id = Number(info.lastInsertRowid);
    const insertPhoto = db.prepare(
      "INSERT INTO photos (entry_id, path, sort_order) VALUES (?, ?, ?)"
    );
    data.photos.forEach((p, i) => insertPhoto.run(id, p, i));
    return id;
  })();
  return getEntryById(entryId)!;
}

// 允许部分更新的字段白名单(拼 SET 子句时只取这里的列,防注入)
const PATCHABLE = new Set([
  "rating",
  "recommend",
  "address",
  "description",
  "hidden",
]);

export function updateEntryPartial(
  id: number,
  fields: Record<string, unknown>
): EntryWithPhotos | null {
  const keys = Object.keys(fields).filter(
    (k) => PATCHABLE.has(k) && fields[k] !== undefined
  );
  if (keys.length === 0) return getEntryById(id);
  const sets = keys.map((k) => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE entries SET ${sets} WHERE id = @id`).run({ ...fields, id });
  return getEntryById(id);
}

export function incrementViews(id: number): number | null {
  const info = db
    .prepare("UPDATE entries SET views = views + 1 WHERE id = ?")
    .run(id);
  if (info.changes === 0) return null;
  return (
    db.prepare("SELECT views FROM entries WHERE id = ?").get(id) as {
      views: number;
    }
  ).views;
}

// 删除记录并返回其所有照片路径(用于清理磁盘文件);记录不存在返回 null
export function deleteEntry(id: number): string[] | null {
  return db.transaction(() => {
    const entry = db
      .prepare("SELECT photo FROM entries WHERE id = ?")
      .get(id) as { photo: string | null } | undefined;
    if (!entry) return null;
    const photos = db
      .prepare("SELECT path FROM photos WHERE entry_id = ?")
      .all(id) as { path: string }[];
    db.prepare("DELETE FROM photos WHERE entry_id = ?").run(id);
    db.prepare("DELETE FROM entries WHERE id = ?").run(id);
    return [
      ...new Set([
        ...photos.map((p) => p.path),
        ...(entry.photo ? [entry.photo] : []),
      ]),
    ];
  })();
}
