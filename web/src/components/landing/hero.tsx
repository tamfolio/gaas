import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ProductMock } from "./product-mock";

const assurances = ["Paystack billing built in", "Works on any phone", "Naira-first, Nigeria-ready"];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* backdrop: masked grid + brand glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_40%,transparent_100%)] bg-[size:56px_56px] opacity-70"
      />
      <div
        aria-hidden
        className="absolute top-[-12rem] left-1/2 -z-10 h-[38rem] w-[min(70rem,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)] blur-2xl"
      />

      <div className="mx-auto max-w-5xl text-center">
        <a
          href="#features"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pr-3 pl-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
        >
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary-text">New</span>
          AI workout plans for every member
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </a>

        <h1 className="mt-7 font-heading text-[clamp(1.9rem,1.2rem+3.6vw,4.25rem)] leading-[1.12] sm:leading-[1.02] font-extrabold tracking-[-0.045em] text-balance text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          The operating system for{" "}
          {/* Inline highlight: wraps per line on phones, each line gets its own lime block */}
          <span className="rounded-[0.12em] bg-primary box-decoration-clone px-[0.1em] pb-[0.06em] text-primary-foreground sm:whitespace-nowrap">
            Nigerian gyms.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed sm:text-lg text-pretty text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-150 motion-safe:fill-mode-both motion-safe:duration-700">
          Members, renewals, QR check-ins, trainers and Paystack payments — in one dashboard
          your whole team actually enjoys using. Ditch the spreadsheets and WhatsApp chases.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:delay-300 motion-safe:fill-mode-both motion-safe:duration-700">
          <Link
            href="/register"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_color-mix(in_oklch,var(--primary)_70%,transparent)] transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            Register your gym
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-full border border-border bg-card/60 px-7 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-muted"
          >
            Sign in
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {assurances.map((a) => (
            <li key={a} className="flex items-center gap-1.5">
              <Check className="size-4 text-primary-text" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-6xl sm:mt-20 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:delay-500 motion-safe:fill-mode-both motion-safe:duration-1000">
        <ProductMock />
      </div>
    </section>
  );
}
