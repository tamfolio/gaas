import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="px-4 pb-24 sm:pb-32">
      <div className="on-dark relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--brand-dark)] px-6 py-20 text-center sm:px-16 sm:py-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,#000_30%,transparent_100%)] bg-[size:48px_48px]"
        />
        <div
          aria-hidden
          className="absolute bottom-[-18rem] left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_45%,transparent),transparent)] blur-2xl"
        />

        <h2 className="mx-auto max-w-[22ch] font-heading text-[clamp(2rem,4.2vw,3.5rem)] leading-[1] font-extrabold tracking-[-0.045em] text-balance text-[var(--brand-dark-fg)]">
          Your gym is a real business. <span className="text-primary-text">Run it like one.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] text-base leading-relaxed text-white/60 sm:text-lg">
          Set up your plans, invite your team and check in your first member this week.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_-8px_color-mix(in_oklch,var(--primary)_80%,transparent)] transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            Register your gym
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
