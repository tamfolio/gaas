import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";

const links = [
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Who it's for" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border border-border/70 bg-background/70 py-2 pr-2 pl-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl">
        <Link href="/" aria-label="EngineRoom home">
          <Logo className="text-base sm:text-[1.1rem]" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="hidden min-[400px]:block">
            <ThemeToggle />
          </span>
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full whitespace-nowrap bg-primary px-3.5 py-2 sm:px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Get started
            <ArrowRight className="hidden size-3.5 transition-transform sm:block group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
