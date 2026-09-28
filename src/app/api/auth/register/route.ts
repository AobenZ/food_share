import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSession,
  createUser,
  hashPassword,
  sessionCookieOptions,
  validatePassword,
  validateUsername,
} from "@/lib/auth";

export async function POST(request: Request) {
  const inviteCode = process.env.REGISTER_INVITE_CODE;
  if (!inviteCode) {
    return NextResponse.json(
      { error: "注册未开放,请联系管理员" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { username, password, inviteCode: code } = (body ?? {}) as Record<
    string,
    unknown
  >;

  const cleanUsername = validateUsername(username);
  if (!cleanUsername) {
    return NextResponse.json(
      { error: "用户名需 2-20 个字符" },
      { status: 400 }
    );
  }

  const cleanPassword = validatePassword(password);
  if (!cleanPassword) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  if (code !== inviteCode) {
    return NextResponse.json({ error: "邀请码不正确" }, { status: 400 });
  }

  let userId: number;
  try {
    userId = createUser(cleanUsername, hashPassword(cleanPassword));
  } catch (err) {
    if ((err as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }
    throw err;
  }

  // 注册成功即自动登录
  const token = createSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json(
    { user: { id: userId, username: cleanUsername } },
    { status: 201 }
  );
}
