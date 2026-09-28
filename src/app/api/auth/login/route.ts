import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSession,
  getUserByUsername,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const user = getUserByUsername(username.trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    // 统一文案,不泄露用户名是否存在
    return NextResponse.json(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  const token = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json({ user: { id: user.id, username: user.username } });
}
