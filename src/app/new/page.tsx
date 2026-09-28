"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function NewEntryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File | null) {
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
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
      // 先传照片,拿到图片路径
      let photoPath: string | null = null;
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => null);
          setError(data?.error ?? "图片上传失败");
          return;
        }
        photoPath = (await uploadRes.json()).path;
      }

      // 再创建记录
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          restaurant: restaurant.trim() || null,
          price: price === "" ? null : Number(price),
          photo: photoPath,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "发布失败,请稍后再试");
        return;
      }

      router.push("/");
      router.refresh();
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
        <div
          className={`form-photo${preview ? " has-photo" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob 预览地址,next/image 不支持
            <img src={preview} alt="照片预览" />
          ) : (
            <span>📷 点击上传照片</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {preview && (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              handleFileChange(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            移除照片
          </button>
        )}

        <label htmlFor="name">名称 *</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="比如:红烧肉"
        />

        <label htmlFor="restaurant">餐厅</label>
        <input
          id="restaurant"
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
          placeholder="比如:外婆家(可选)"
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

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "发布中..." : "发布"}
        </button>
      </form>
    </div>
  );
}
