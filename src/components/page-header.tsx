import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="label-micro mb-3 text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="text-display text-4xl sm:text-[2.75rem]">{title}</h1>
        {description ? (
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  );
}
