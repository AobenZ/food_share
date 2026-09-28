import { NextResponse } from "next/server";
import { createEntry } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTOS,
  RECOMMEND_LEVELS,
  type RecommendLevel,
} from "@/lib/constants";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { name, restaurant, price, photos, rating, recommend, address, description } =
    (body ?? {}) as Record<string, unknown>;

  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName) {
    return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
  }

  const cleanRestaurant =
    typeof restaurant === "string" && restaurant.trim()
      ? restaurant.trim()
      : null;
  const cleanPrice =
    typeof price === "number" && Number.isFinite(price) && price >= 0
      ? price
      : null;

  // photos:字符串数组,去重保序,须 /uploads/ 前缀,≤ 9 张
  const rawPhotos = photos === undefined ? [] : photos;
  if (
    !Array.isArray(rawPhotos) ||
    rawPhotos.some((p) => typeof p !== "string")
  ) {
    return NextResponse.json({ error: "照片格式不正确" }, { status: 400 });
  }
  const cleanPhotos = [...new Set(rawPhotos as string[])];
  if (cleanPhotos.some((p) => !p.startsWith("/uploads/"))) {
    return NextResponse.json({ error: "照片路径不合法" }, { status: 400 });
  }
  if (cleanPhotos.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `最多上传 ${MAX_PHOTOS} 张照片` },
      { status: 400 }
    );
  }

  // rating:null 或 1-5 整数
  let cleanRating: number | null = null;
  if (rating !== undefined && rating !== null) {
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "评分必须是 1-5 的整数" },
        { status: 400 }
      );
    }
    cleanRating = rating;
  }

  // recommend:null 或四档之一
  let cleanRecommend: RecommendLevel | null = null;
  if (recommend !== undefined && recommend !== null) {
    if (
      typeof recommend !== "string" ||
      !(RECOMMEND_LEVELS as readonly string[]).includes(recommend)
    ) {
      return NextResponse.json({ error: "推荐等级不合法" }, { status: 400 });
    }
    cleanRecommend = recommend as RecommendLevel;
  }

  const cleanAddress =
    typeof address === "string" && address.trim() ? address.trim() : null;

  // description:可选,超长报错而不是静默截断
  if (
    typeof description === "string" &&
    description.trim().length > MAX_DESCRIPTION_LENGTH
  ) {
    return NextResponse.json(
      { error: `描述不能超过 ${MAX_DESCRIPTION_LENGTH} 字` },
      { status: 400 }
    );
  }
  const cleanDescription =
    typeof description === "string" && description.trim()
      ? description.trim()
      : null;

  const entry = createEntry({
    name: cleanName,
    restaurant: cleanRestaurant,
    price: cleanPrice,
    photos: cleanPhotos,
    rating: cleanRating,
    recommend: cleanRecommend,
    address: cleanAddress,
    description: cleanDescription,
    authorId: user.id,
  });

  return NextResponse.json({ entry }, { status: 201 });
}
