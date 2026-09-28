import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";
import { sanitizeNextPath } from "@/lib/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="container container-narrow">
      <Link className="back-link" href="/">
        ← 返回
      </Link>
      <h1 className="form-title">注册</h1>
      <RegisterForm next={sanitizeNextPath(next)} />
    </div>
  );
}
