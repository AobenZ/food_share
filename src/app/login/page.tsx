import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { sanitizeNextPath } from "@/lib/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="container container-narrow">
      <Link className="back-link" href="/">
        ← 返回
      </Link>
      <h1 className="form-title">登录</h1>
      <LoginForm next={sanitizeNextPath(next)} />
    </div>
  );
}
