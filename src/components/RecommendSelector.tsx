"use client";

import { RECOMMEND_LEVELS, type RecommendLevel } from "@/lib/constants";

export default function RecommendSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: RecommendLevel | null;
  onChange: (value: RecommendLevel | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="pills">
      {RECOMMEND_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          className={`pill${value === level ? " active" : ""}`}
          disabled={disabled}
          onClick={() => onChange(value === level ? null : level)}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
