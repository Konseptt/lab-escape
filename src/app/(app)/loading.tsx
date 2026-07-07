import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-none" />
        <Skeleton className="h-10 w-64 max-w-full rounded-none" />
        <Skeleton className="h-4 w-96 max-w-full rounded-none" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 bg-background p-6">
            <Skeleton className="h-3 w-16 rounded-none" />
            <Skeleton className="h-8 w-20 rounded-none" />
          </div>
        ))}
      </div>
      <div className="mt-12 space-y-4">
        <Skeleton className="h-9 w-full max-w-md rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    </div>
  );
}
