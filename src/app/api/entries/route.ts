import { NextResponse } from "next/server";
import { createEntry } from "@/lib/db";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { name, restaurant, price, photo } = (body ?? {}) as Record<
    string,
    unknown
  >;

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
  const cleanPhoto =
    typeof photo === "string" && photo.startsWith("/uploads/") ? photo : null;

  const entry = createEntry({
    name: cleanName,
    restaurant: cleanRestaurant,
    price: cleanPrice,
    photo: cleanPhoto,
  });

  return NextResponse.json({ entry }, { status: 201 });
}
