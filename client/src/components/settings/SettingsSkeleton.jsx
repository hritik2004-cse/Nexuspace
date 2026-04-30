"use client";

export default function SettingsSkeleton() {
  return (
    <div className="animate-pulse space-y-8 max-w-4xl">
      {/* Profile Header Skeleton */}
      <div className="flex items-center gap-8 bg-surface/20 p-8 rounded-3xl border border-border/50">
        <div className="w-32 h-32 bg-white/5 rounded-3xl" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-32 bg-white/5 rounded-lg" />
          <div className="h-6 w-24 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Form Section Skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-white/5 rounded mx-1" />
              <div className="h-14 w-full bg-white/5 border border-white/10 rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-white/5 rounded mx-1" />
          <div className="h-14 w-full bg-white/5 border border-white/10 rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-white/5 rounded mx-1" />
          <div className="h-32 w-full bg-white/5 border border-white/10 rounded-2xl" />
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-14 w-full bg-white/10 rounded-2xl mt-8" />
    </div>
  );
}
