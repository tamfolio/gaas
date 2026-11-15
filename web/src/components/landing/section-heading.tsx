import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  desc,
  className,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <p className="text-xs font-semibold tracking-[0.18em] text-primary-text uppercase">{eyebrow}</p>
      <h2 className="mt-4 font-heading text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance text-foreground">
        {title}
      </h2>
      {desc && (
        <p className="mt-5 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{desc}</p>
      )}
    </div>
  );
}
