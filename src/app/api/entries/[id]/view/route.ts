import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/db";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/entries/[id]/view">
) {
  const { id } = await ctx.params;
  const entryId = Number(id);
  if (!Number.isInteger(entryId) || entryId <= 0) {
    return NextResponse.json({ error: "无效的记录" }, { status: 400 });
  }

  const views = incrementViews(entryId);
  if (views === null) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  return NextResponse.json({ views });
}
