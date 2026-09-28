"use client";

import Image from "next/image";
import { useState } from "react";

export default function PhotoGallery({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = Math.min(active, photos.length - 1);

  if (photos.length === 0) {
    return (
      <div className="gallery-empty">
        <span>🍽️</span>
        <p>没有照片</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-main">
        <Image
          src={photos[current]}
          alt={name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              className={`thumb${i === current ? " active" : ""}`}
              onClick={() => setActive(i)}
            >
              <Image src={p} alt={`${name} 第 ${i + 1} 张`} fill sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
