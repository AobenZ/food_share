"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, inviteCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "注册失败,请稍后再试");
        return;
      }
      // 注册成功即已自动登录
      router.replace(next);
      router.refresh();
    } catch {
      setError("网络错误,请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label htmlFor="username">用户名</label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="2-20 个字符,支持中文"
        autoFocus
      />

      <label htmlFor="password">密码</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="至少 6 位"
      />

      <label htmlFor="confirm">确认密码</label>
      <input
        id="confirm"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="再输入一次密码"
      />

      <label htmlFor="inviteCode">邀请码</label>
      <input
        id="inviteCode"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="问站长要邀请码"
      />

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "注册中..." : "注册"}
      </button>

      <p className="form-footer">
        已有账号?
        <Link href={`/login?next=${encodeURIComponent(next)}`}>登录</Link>
      </p>
    </form>
  );
}
