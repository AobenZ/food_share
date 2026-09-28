"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import StarRatingInput from "@/components/StarRatingInput";
import RecommendSelector from "@/components/RecommendSelector";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PHOTOS,
  type RecommendLevel,
} from "@/lib/constants";

type PhotoItem = { file: File; preview: string };

export default function NewEntryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [recommend, setRecommend] = useState<RecommendLevel | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 卸载时回收预览 object URL
  useEffect(() => {
    const current = photos;
    return () => current.forEach((p) => URL.revokeObjectURL(p.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const picked = Array.from(files).slice(0, remaining);
    setPhotos((prev) => [
      ...prev,
      ...picked.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    // 重置 input,让同一个文件可以再次被选择
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  // 会话在发布途中过期 → 跳登录页,登录后回到发布页
  function handleUnauthorized() {
    router.replace("/login?next=/new");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("名称不能为空");
      return;
    }

    setSubmitting(true);
    try {
      // 逐张上传照片,顺序即封面顺序
      const paths: string[] = [];
      for (const item of photos) {
        const formData = new FormData();
        formData.append("file", item.file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => null);
          setError(data?.error ?? "图片上传失败");
          return;
        }
        paths.push((await uploadRes.json()).path);
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          restaurant: restaurant.trim() || null,
          price: price === "" ? null : Number(price),
          address: address.trim() || null,
          description: description.trim() || null,
          rating,
          recommend,
          photos: paths,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) {
        // 注意:走到这里失败时,已上传的照片会成为孤儿文件(个人项目可接受)
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "发布失败,请稍后再试");
        return;
      }

      const data = await res.json();
      router.push(`/food/${data.entry.id}`);
    } catch {
      setError("网络错误,请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container container-narrow">
      <Link className="back-link" href="/">
        ← 返回
      </Link>
      <h1 className="form-title">发布美食</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          照片({photos.length}/{MAX_PHOTOS},第一张为封面)
        </label>
        <div className="thumbnails">
          {photos.map((item, i) => (
            <div className="thumb-item" key={item.preview}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 本地 object URL 预览,next/image 不支持 */}
              <img src={item.preview} alt={`照片 ${i + 1}`} />
              {i === 0 && <span className="thumb-cover">封面</span>}
              <button
                type="button"
                className="thumb-remove"
                aria-label="移除照片"
                onClick={() => removePhoto(i)}
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              className="thumb-add"
              onClick={() => fileInputRef.current?.click()}
            >
              ＋
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        <label htmlFor="name">名称 *</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="比如:红烧肉"
        />

        <label htmlFor="description">描述</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="说说这道菜怎么样:味道、口感、分量、值得再来吗?(可选)"
          rows={4}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />

        <label htmlFor="restaurant">餐厅</label>
        <input
          id="restaurant"
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
          placeholder="比如:外婆家(可选)"
        />

        <label htmlFor="address">实际地址</label>
        <input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="比如:武林路xx号(可选)"
        />

        <label htmlFor="price">价格(元)</label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="比如:58(可选)"
        />

        <label>评分</label>
        <StarRatingInput value={rating} onChange={setRating} />

        <label>推荐等级</label>
        <RecommendSelector value={recommend} onChange={setRecommend} />

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "发布中..." : "发布"}
        </button>
      </form>
    </div>
  );
}
