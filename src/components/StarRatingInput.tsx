"use client";

const STARS = [1, 2, 3, 4, 5];

export default function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <span className="stars">
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          className={`star${value !== null && n <= value ? " filled" : ""}`}
          aria-label={`${n} 星`}
          disabled={disabled}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
      {value !== null && !disabled && (
        <button
          type="button"
          className="link-btn"
          onClick={() => onChange(null)}
        >
          清除评分
        </button>
      )}
    </span>
  );
}
