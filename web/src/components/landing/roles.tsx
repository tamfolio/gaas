import { Check, Dumbbell, LayoutDashboard, Smartphone, type LucideIcon } from "lucide-react";
import { SectionHeading } from "./section-heading";

const roles: { icon: LucideIcon; who: string; title: string; points: string[] }[] = [
  {
    icon: LayoutDashboard,
    who: "Owners & admins",
    title: "See the whole business at a glance",
    points: [
      "Revenue, active members and renewals due",
      "Membership plans, pricing and branch access",
      "Staff invites with role-based access",
      "Announcements to every member at once",
    ],
  },
  {
    icon: Dumbbell,
    who: "Trainers",
    title: "Coach more, admin less",
    points: [
      "Your assigned members in one list",
      "BMI, attendance and progress per member",
      "Build plans from a full exercise library",
      "Spot who's been skipping sessions",
    ],
  },
  {
    icon: Smartphone,
    who: "Members",
    title: "A gym app in their pocket",
    points: [
      "Scan to check in at any allowed branch",
      "Renew their plan online in seconds",
      "AI workout plans, timer and BMI tracker",
      "Referral code that earns free days",
    ],
  },
];

export function Roles() {
  return (
    <section id="roles" className="scroll-mt-24 border-y border-border bg-muted/40 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Who it's for"
          title="One platform. Every person in your gym."
          desc="Owners, front desk, trainers and members each get a view built for what they do."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {roles.map(({ icon: Icon, who, title, points }) => (
            <div key={who} className="rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-foreground text-background">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">{who}</span>
              </div>
              <h3 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h3>
              <ul className="mt-6 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary-text" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
