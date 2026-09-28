"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "登录失败,请稍后再试");
        return;
      }
      router.replace(next);
      // 让 header 等服务器组件重新渲染登录状态
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
        placeholder="你的用户名"
        autoFocus
      />

      <label htmlFor="password">密码</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="你的密码"
      />

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "登录中..." : "登录"}
      </button>

      <p className="form-footer">
        还没有账号?
        <Link href={`/register?next=${encodeURIComponent(next)}`}>注册</Link>
      </p>
    </form>
  );
}
