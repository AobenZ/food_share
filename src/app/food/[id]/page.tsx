import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntryById } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import type { RecommendLevel } from "@/lib/constants";
import PhotoGallery from "@/components/PhotoGallery";
import ViewCounter from "@/components/ViewCounter";
import EntryControls from "@/components/EntryControls";

// 数据来自数据库,每次请求都要重新渲染
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entryId = Number(id);
  const entry =
    Number.isInteger(entryId) && entryId > 0 ? getEntryById(entryId) : null;
  return {
    title: entry ? `${entry.name} · 美食日记` : "美食日记",
  };
}

export default async function FoodDetailPage({ params }: Props) {
  const { id } = await params;
  const entryId = Number(id);
  if (!Number.isInteger(entryId) || entryId <= 0) notFound();
  const entry = getEntryById(entryId);
  if (!entry) notFound();

  const user = await getSessionUser();
  const isAuthor = user !== null && entry.author_id === user.id;

  return (
    <div className="container container-narrow">
      <Link className="back-link" href="/">
        ← 返回
      </Link>

      <PhotoGallery photos={entry.photos.map((p) => p.path)} name={entry.name} />

      <div className="detail-head">
        <h1>{entry.name}</h1>
        <div className="detail-meta">
          {entry.recommend && (
            <span className="recommend-badge">{entry.recommend}</span>
          )}
          {entry.price != null && (
            <span className="price-text">¥{entry.price}</span>
          )}
          <span className="detail-author">
            👤 {entry.author_name ?? "未知发布人"}
          </span>
          <ViewCounter entryId={entry.id} initialViews={entry.views} />
          <span className="detail-date">
            🕐 {entry.created_at.slice(0, 16)}
          </span>
        </div>
        {(entry.restaurant || entry.address) && (
          <p className="detail-location">
            {entry.restaurant && <>🍴 {entry.restaurant}</>}
            {entry.restaurant && entry.address && (
              <span className="sep"> · </span>
            )}
            {entry.address && <>📍 {entry.address}</>}
          </p>
        )}
        {entry.description && (
          <p className="detail-description">{entry.description}</p>
        )}
      </div>

      {isAuthor && (
        <EntryControls
          id={entry.id}
          rating={entry.rating}
          recommend={entry.recommend as RecommendLevel | null}
          address={entry.address}
          description={entry.description}
          hidden={entry.hidden}
        />
      )}
    </div>
  );
}
