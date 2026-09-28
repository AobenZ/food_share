import Image from "next/image";
import Link from "next/link";
import { getEntries } from "@/lib/db";

// 数据来自数据库,每次请求都要重新渲染,不能用构建时的静态快照
export const dynamic = "force-dynamic";

export default function Home() {
  const entries = getEntries();

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-badge">🍜</div>
        <h1>我的美食日记</h1>
        <p>记录每一顿值得记住的好吃的</p>
        {entries.length > 0 && (
          <span className="hero-stat">🍽️ 已记录 {entries.length} 道美食</span>
        )}
      </section>

      {entries.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">🍽️</div>
          <h2>还没有美食记录</h2>
          <p>吃到了好东西?拍下来,记下来</p>
          <Link className="btn btn-primary" href="/new">
            发布第一条美食
          </Link>
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
              <article className="card" key={entry.id}>
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
                    </>
                  ) : (
                    <span className="card-placeholder">🍽️</span>
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
                  <p className="card-date">🕐 {entry.created_at.slice(0, 16)}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
