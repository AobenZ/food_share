import { NextResponse } from "next/server";
import { deleteEntry, getEntryById, updateEntryPartial } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { RECOMMEND_LEVELS } from "@/lib/constants";
import { deleteUploadedFiles } from "@/lib/uploads";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/entries/[id]">
) {
  // 检查顺序:401 未登录 → 400 id 无效 → 404 不存在 → 403 非作者
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const entryId = parseId(id);
  if (entryId === null) {
    return NextResponse.json({ error: "无效的记录" }, { status: 400 });
  }

  const existing = getEntryById(entryId);
  if (!existing) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  if (existing.author_id !== user.id) {
    return NextResponse.json(
      { error: "只能编辑自己发布的内容" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { rating, recommend, address, hidden } = (body ?? {}) as Record<
    string,
    unknown
  >;
  const fields: Record<string, unknown> = {};

  if (rating !== undefined) {
    if (
      rating !== null &&
      (typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5)
    ) {
      return NextResponse.json(
        { error: "评分必须是 1-5 的整数" },
        { status: 400 }
      );
    }
    fields.rating = rating;
  }

  if (recommend !== undefined) {
    if (
      recommend !== null &&
      (typeof recommend !== "string" ||
        !(RECOMMEND_LEVELS as readonly string[]).includes(recommend))
    ) {
      return NextResponse.json({ error: "推荐等级不合法" }, { status: 400 });
    }
    fields.recommend = recommend;
  }

  if (address !== undefined) {
    fields.address =
      typeof address === "string" && address.trim() ? address.trim() : null;
  }

  if (hidden !== undefined) {
    if (hidden !== 0 && hidden !== 1 && typeof hidden !== "boolean") {
      return NextResponse.json(
        { error: "hidden 必须是 0/1 或布尔值" },
        { status: 400 }
      );
    }
    fields.hidden = hidden ? 1 : 0;
  }

  const entry = updateEntryPartial(entryId, fields);
  if (!entry) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  return NextResponse.json({ entry });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/entries/[id]">
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const entryId = parseId(id);
  if (entryId === null) {
    return NextResponse.json({ error: "无效的记录" }, { status: 400 });
  }

  const existing = getEntryById(entryId);
  if (!existing) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  if (existing.author_id !== user.id) {
    return NextResponse.json(
      { error: "只能编辑自己发布的内容" },
      { status: 403 }
    );
  }

  const paths = deleteEntry(entryId);
  if (paths === null) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }
  // 先删数据库行,再清磁盘文件(文件缺失会被忽略)
  deleteUploadedFiles(paths);
  return NextResponse.json({ ok: true });
}
