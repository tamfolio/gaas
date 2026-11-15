import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-heading text-[1.1rem] font-extrabold tracking-[-0.04em] text-foreground",
        className,
      )}
    >
      Engine<span className="text-primary-text">Room</span>
    </span>
  );
}
