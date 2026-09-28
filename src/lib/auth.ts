import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

// 注意:本模块依赖请求上下文(cookies),只能在服务端组件 / 路由处理器中使用
export const SESSION_COOKIE = "session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天

export type SessionUser = { id: number; username: string };

// scrypt 参数固定,避免依赖默认值
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, SCRYPT_OPTS);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(
    password,
    Buffer.from(saltHex, "hex"),
    expected.length,
    SCRYPT_OPTS
  );
  return timingSafeEqual(actual, expected);
}

// 每个登录/注册生成一个新会话(允许多设备并存);顺手清理过期会话
export function createSession(userId: number): string {
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(Date.now());
  const token = randomBytes(32).toString("hex");
  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, Date.now() + SESSION_TTL_MS);
  return token;
}

export function deleteSession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = db
    .prepare(
      `SELECT u.id, u.username
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .get(token, Date.now()) as SessionUser | undefined;
  if (!user) {
    // 无效/过期的会话,删掉死行
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return user;
}

// 未登录跳转登录页(仅 /new 这类需要登录的页面使用)
export async function requireUser(next = "/"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

// 只允许站内路径,防开放重定向(拒绝 // 开头和绝对 URL)
export function sanitizeNextPath(raw: string | undefined): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

// 用户表操作(放这里,db.ts 专注 entries)
export function createUser(username: string, passwordHash: string): number {
  const info = db
    .prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);
  return Number(info.lastInsertRowid);
}

export function getUserByUsername(
  username: string
):
  | { id: number; username: string; password_hash: string }
  | undefined {
  return db
    .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;
}

// 按码点计数 2-20 字符,中文用户名能正确校验
export function validateUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim();
  const len = [...name].length;
  if (len < 2 || len > 20) return null;
  return name;
}

// 6-100 位;上限防 scrypt DoS
export function validatePassword(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length < 6 || raw.length > 100) return null;
  return raw;
}
