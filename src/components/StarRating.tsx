import { Star } from "lucide-react";

export default function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (reviews === 0) return null;
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden
            className={`size-3.5 ${i < full ? "fill-star text-star" : "fill-line text-line"}`}
          />
        ))}
      </span>
      <span className="text-xs text-muted">({reviews})</span>
    </div>
  );
}
