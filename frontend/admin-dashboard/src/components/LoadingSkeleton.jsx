export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-16 h-4 rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton w-24 h-8 rounded" />
        <div className="skeleton w-32 h-4 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-dark-100 dark:border-dark-700">
        <div className="skeleton w-48 h-6 rounded" />
      </div>
      <div className="divide-y divide-dark-100 dark:divide-dark-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="skeleton h-4 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="skeleton w-40 h-5 rounded mb-6" />
      <div className="skeleton w-full h-64 rounded-xl" />
    </div>
  );
}
