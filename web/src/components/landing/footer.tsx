import Link from "next/link";
import { Logo } from "./logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#roles", label: "Who it's for" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/register", label: "Register your gym" },
      { href: "/login", label: "Sign in" },
      { href: "/forgot-password", label: "Forgot password" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-4 pt-16 pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo className="text-xl" />
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            The operating system for Nigerian gyms — members, payments, check-ins and trainers in
            one place.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-foreground">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-col justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} EngineRoom. All rights reserved.</p>
        <p>Built for Nigerian gym businesses.</p>
      </div>
    </footer>
  );
}
