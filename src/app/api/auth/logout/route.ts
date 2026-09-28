import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, deleteSession } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    // 只删当前会话,不影响其他设备的登录
    deleteSession(token);
  }
  cookieStore.delete(SESSION_COOKIE);
  // 已登出时再登出也返回 200(幂等)
  return NextResponse.json({ ok: true });
}
