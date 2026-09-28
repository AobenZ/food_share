import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty">
        <div className="empty-emoji">🕵️</div>
        <h2>这条记录不存在或已被删除</h2>
        <p>去看看别的美食吧</p>
        <Link className="btn btn-primary" href="/">
          回到首页
        </Link>
      </div>
    </div>
  );
}
