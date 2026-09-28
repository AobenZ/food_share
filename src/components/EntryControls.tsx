"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StarRatingInput from "./StarRatingInput";
import RecommendSelector from "./RecommendSelector";
import { MAX_DESCRIPTION_LENGTH, type RecommendLevel } from "@/lib/constants";

export default function EntryControls({
  id,
  rating: initialRating,
  recommend: initialRecommend,
  address: initialAddress,
  description: initialDescription,
  hidden: initialHidden,
}: {
  id: number;
  rating: number | null;
  recommend: RecommendLevel | null;
  address: string | null;
  description: string | null;
  hidden: number;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(initialRating);
  const [recommend, setRecommend] = useState<RecommendLevel | null>(
    initialRecommend
  );
  const [address, setAddress] = useState<string | null>(initialAddress);
  const [hidden, setHidden] = useState<number>(initialHidden);
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState(initialAddress ?? "");
  const [description, setDescription] = useState<string | null>(
    initialDescription
  );
  const [editingDescription, setEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState(
    initialDescription ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 每次修改立即 PATCH,成功用响应更新本地状态
  // (不用 router.refresh:server 重渲染不会更新 useState 的初始值)
  async function patch(fields: Record<string, unknown>): Promise<boolean> {
    setError("");
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "保存失败,请稍后再试");
        return false;
      }
      return true;
    } catch {
      setError("网络错误,请稍后再试");
      return false;
    }
  }

  async function handleRatingChange(value: number | null) {
    if (await patch({ rating: value })) setRating(value);
  }

  async function handleRecommendChange(value: RecommendLevel | null) {
    if (await patch({ recommend: value })) setRecommend(value);
  }

  async function handleAddressSave() {
    const value = draftAddress.trim() || null;
    if (await patch({ address: value })) {
      setAddress(value);
      setEditingAddress(false);
    }
  }

  async function handleDescriptionSave() {
    const value = draftDescription.trim() || null;
    if (await patch({ description: value })) {
      setDescription(value);
      setEditingDescription(false);
    }
  }

  async function handleToggleHidden() {
    const next = hidden ? 0 : 1;
    if (await patch({ hidden: next })) setHidden(next);
  }

  async function handleDelete() {
    if (!window.confirm("确定删除这条记录吗?照片也会一并删除,无法恢复。")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "删除失败,请稍后再试");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误,请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="controls">
      {hidden === 1 && <span className="hidden-badge">已隐藏</span>}

      <div className="control-row">
        <span className="control-label">评分</span>
        <StarRatingInput value={rating} onChange={handleRatingChange} />
      </div>

      <div className="control-row">
        <span className="control-label">推荐等级</span>
        <RecommendSelector value={recommend} onChange={handleRecommendChange} />
      </div>

      <div className="control-row">
        <span className="control-label">地址</span>
        {editingAddress ? (
          <span className="address-edit">
            <input
              value={draftAddress}
              onChange={(e) => setDraftAddress(e.target.value)}
              placeholder="填写具体地址,比如 xx路xx号"
              autoFocus
            />
            <button
              type="button"
              className="btn btn-small btn-primary"
              onClick={handleAddressSave}
            >
              保存
            </button>
            <button
              type="button"
              className="btn btn-small btn-ghost"
              onClick={() => {
                setEditingAddress(false);
                setDraftAddress(address ?? "");
              }}
            >
              取消
            </button>
          </span>
        ) : (
          <span className="address-text">
            {address ?? <span className="muted">未填写</span>}
            <button
              type="button"
              className="link-btn"
              onClick={() => setEditingAddress(true)}
            >
              编辑
            </button>
          </span>
        )}
      </div>

      <div className="control-row">
        <span className="control-label">描述</span>
        {editingDescription ? (
          <div className="description-edit">
            <textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="说说这道菜怎么样(可选)"
              rows={4}
              maxLength={MAX_DESCRIPTION_LENGTH}
              autoFocus
            />
            <div className="description-edit-actions">
              <button
                type="button"
                className="btn btn-small btn-primary"
                onClick={handleDescriptionSave}
              >
                保存
              </button>
              <button
                type="button"
                className="btn btn-small btn-ghost"
                onClick={() => {
                  setEditingDescription(false);
                  setDraftDescription(description ?? "");
                }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <span className="description-text">
            {description ? (
              <span className="description-value">{description}</span>
            ) : (
              <span className="muted">未填写</span>
            )}
            <button
              type="button"
              className="link-btn"
              onClick={() => setEditingDescription(true)}
            >
              编辑
            </button>
          </span>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="control-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleToggleHidden}
          disabled={busy}
        >
          {hidden ? "取消隐藏" : "隐藏"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "删除中..." : "删除"}
        </button>
      </div>
    </div>
  );
}
