import { requireUser } from "@/lib/auth";
import NewEntryForm from "@/components/NewEntryForm";

// 发布需要登录:未登录重定向到登录页,登录后跳回
export default async function NewEntryPage() {
  await requireUser("/new");
  return <NewEntryForm />;
}
