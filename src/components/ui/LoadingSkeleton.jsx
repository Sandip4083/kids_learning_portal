"use client";

export default function LoadingSkeleton({ type = "card", count = 3 }) {
  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border-color)]">
            <div className="h-40 animate-shimmer" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 rounded-full animate-shimmer" />
              <div className="h-4 w-full rounded-full animate-shimmer" />
              <div className="h-4 w-2/3 rounded-full animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "quiz") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-1/2 rounded-full animate-shimmer mx-auto" />
        <div className="bg-[var(--surface)] rounded-2xl p-6 space-y-4 border border-[var(--border-color)]">
          <div className="h-6 w-3/4 rounded-full animate-shimmer" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl animate-shimmer" />
      ))}
    </div>
  );
}
