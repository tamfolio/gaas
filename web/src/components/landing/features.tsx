import {
  Bell,
  Building2,
  CreditCard,
  Gift,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

function Card({
  icon: Icon,
  title,
  desc,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-7",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary-text">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">{desc}</p>
      {children && <div className="mt-6 flex-1">{children}</div>}
    </div>
  );
}

const renewals = [
  { name: "Amaka Okonkwo", plan: "Premium · Monthly", status: "Active", tone: "ok" },
  { name: "Chidi Balogun", plan: "Basic · Quarterly", status: "3 days left", tone: "warn" },
  { name: "Funke Adeyemi", plan: "Premium · Monthly", status: "Expired", tone: "bad" },
];

const tone = {
  ok: "bg-primary text-primary-foreground",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  bad: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

// Deterministic pseudo-QR pattern so server and client render identically.
const qrCells = Array.from({ length: 121 }, (_, i) => {
  const x = i % 11;
  const y = Math.floor(i / 11);
  const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
  return finder || (x * 7 + y * 13 + x * y) % 5 < 2;
});

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything your gym runs on. Nothing it doesn't."
          desc="Built around how Nigerian gyms actually operate — cash and card, multiple branches, front-desk staff and members on their phones."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card
            icon={Users}
            title="Members & renewals on autopilot"
            desc="Every member's plan, payments, check-ins and BMI history in one profile. EngineRoom flags who's expiring and reminds them for you at 7 and 3 days out."
            className="md:col-span-2 lg:col-span-4"
          >
            <div className="rounded-2xl border border-border bg-background/60 p-2">
              {renewals.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 odd:bg-muted/50"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary-text">
                    {r.name.split(" ").map((p) => p[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.plan}</div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone[r.tone as keyof typeof tone])}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            icon={QrCode}
            title="QR check-in"
            desc="Members scan the code at the door. You see a live attendance log — no logbook, no queue."
            className="lg:col-span-2"
          >
            <div className="grid h-full place-items-center">
              <div className="grid grid-cols-11 gap-[3px] rounded-2xl border border-border bg-background p-4">
                {qrCells.map((on, i) => (
                  <span key={i} className={cn("size-2.5 rounded-[2px]", on ? "bg-foreground" : "bg-transparent")} />
                ))}
              </div>
            </div>
          </Card>

          <Card
            icon={CreditCard}
            title="Paystack payments"
            desc="Members renew online by card, transfer or USSD. Payments reconcile automatically — manual cash entries too."
            className="lg:col-span-2"
          >
            <div className="space-y-2">
              {[
                ["₦25,000", "Card · Paystack"],
                ["₦60,000", "Transfer · Paystack"],
                ["₦15,000", "Cash · Front desk"],
              ].map(([amt, via]) => (
                <div key={via} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2 text-sm">
                  <span className="font-semibold text-foreground">{amt}</span>
                  <span className="text-xs text-muted-foreground">{via}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            icon={Sparkles}
            title="AI workout plans"
            desc="Generate a personalised plan for any member in seconds, or let trainers build one from a full exercise library."
            className="lg:col-span-2"
          >
            <div className="space-y-2 rounded-2xl border border-border bg-background/60 p-3 text-sm">
              {[
                ["Mon", "Push · Bench, OHP, Dips"],
                ["Wed", "Pull · Rows, Pull-ups"],
                ["Fri", "Legs · Squat, RDL, Lunges"],
              ].map(([d, w]) => (
                <div key={d} className="flex gap-3">
                  <span className="w-8 font-semibold text-primary-text">{d}</span>
                  <span className="text-muted-foreground">{w}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            icon={Building2}
            title="Multi-branch ready"
            desc="Run Lekki and Yaba from one account. Per-branch QR codes and plans that grant access to one branch or all."
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              {["Lekki", "Yaba", "Ikeja GRA", "Abuja · Wuse 2"].map((b, i) => (
                <span
                  key={b}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                    i === 0 ? "border-primary/40 bg-primary/10 text-primary-text" : "border-border text-muted-foreground",
                  )}
                >
                  {b}
                </span>
              ))}
            </div>
          </Card>

          <Card
            icon={Bell}
            title="Reminders that send themselves"
            desc="Push notifications and emails for expiring plans, announcements, and members you haven't seen in a while."
            className="lg:col-span-2"
          />
          <Card
            icon={ShieldCheck}
            title="Team roles & permissions"
            desc="Invite a second admin, front-desk staff or an accountant — each sees only what their role needs."
            className="lg:col-span-2"
          />
          <Card
            icon={Gift}
            title="Referrals & guest passes"
            desc="Every member gets a referral code that earns free days. Set monthly guest passes per plan and capture guest leads."
            className="md:col-span-2 lg:col-span-2"
          />
        </div>
      </div>
    </section>
  );
}
