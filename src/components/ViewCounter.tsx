"use client";

import { useEffect, useState } from "react";

export default function ViewCounter({
  entryId,
  initialViews,
}: {
  entryId: number;
  initialViews: number;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `food-viewed-${entryId}`;
    if (sessionStorage.getItem(key)) return;
    // 关键:先同步写入标记,再发请求 —— StrictMode 双执行时第二次会直接跳过
    sessionStorage.setItem(key, "1");
    let cancelled = false;
    fetch(`/api/entries/${entryId}/view`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !cancelled) setViews(d.views);
      })
      .catch(() => {
        // 失败静默,保持显示初始值
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  return <span className="views">👁 {views}</span>;
}
