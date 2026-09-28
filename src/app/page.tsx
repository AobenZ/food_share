import Image from "next/image";
import Link from "next/link";
import { getEntries } from "@/lib/db";

// 数据来自数据库,每次请求都要重新渲染,不能用构建时的静态快照
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ hidden?: string }> };

export default async function Home({ searchParams }: Props) {
  const { hidden } = await searchParams;
  const hiddenOnly = hidden === "1";
  const entries = getEntries({ hiddenOnly });

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-badge">🍜</div>
        <h1>我的美食日记</h1>
        <p>记录每一顿值得记住的好吃的</p>
        {!hiddenOnly && entries.length > 0 && (
          <span className="hero-stat">🍽️ 已记录 {entries.length} 道美食</span>
        )}
      </section>

      <div className="tabs">
        <Link className={`tab${hiddenOnly ? "" : " active"}`} href="/">
          展示中
        </Link>
        <Link className={`tab${hiddenOnly ? " active" : ""}`} href="/?hidden=1">
          隐藏的
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🍽️</div>
          <h2>{hiddenOnly ? "没有隐藏的记录" : "还没有美食记录"}</h2>
          <p>
            {hiddenOnly
              ? "隐藏的帖子会出现在这里"
              : "吃到了好东西?拍下来,记下来"}
          </p>
          {!hiddenOnly && (
            <Link className="btn btn-primary" href="/new">
              发布第一条美食
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="toolbar">
            <span className="toolbar-count">共 {entries.length} 条记录</span>
            <Link className="btn btn-primary" href="/new">
              ＋ 发布美食
            </Link>
          </div>
          <div className="grid">
            {entries.map((entry) => (
              <Link className="card" href={`/food/${entry.id}`} key={entry.id}>
                <div className="card-photo">
                  {entry.photo ? (
                    <>
                      <Image
                        src={entry.photo}
                        alt={entry.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      {entry.price != null && (
                        <span className="price-badge">¥{entry.price}</span>
                      )}
                      {entry.recommend && (
                        <span className="recommend-tag">{entry.recommend}</span>
                      )}
                    </>
                  ) : (
                    <span className="card-placeholder">🍽️</span>
                  )}
                  {entry.hidden === 1 && (
                    <span className="hidden-chip">已隐藏</span>
                  )}
                </div>
                <div className="card-body">
                  <h2>{entry.name}</h2>
                  <p className="card-meta">
                    {entry.restaurant && <>📍 {entry.restaurant}</>}
                    {!entry.photo && entry.price != null && (
                      <>
                        {entry.restaurant && " · "}¥{entry.price}
                      </>
                    )}
                  </p>
                  <p className="card-date">
                    {entry.rating != null && (
                      <span className="card-stars">
                        {"★".repeat(entry.rating)}
                        {"☆".repeat(5 - entry.rating)}
                      </span>
                    )}
                    <span>🕐 {entry.created_at.slice(0, 16)}</span>
                    <span className="card-author">
                      👤 {entry.author_name ?? "未知发布人"}
                    </span>
                    <span className="card-views">👁 {entry.views}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
