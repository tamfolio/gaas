import {
  Bell,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";

const sidebar = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Users, label: "Members" },
  { icon: Dumbbell, label: "Trainers" },
  { icon: CreditCard, label: "Payments" },
  { icon: QrCode, label: "Check-in" },
  { icon: Bell, label: "Notifications" },
];

const stats = [
  { label: "Active members", value: "247", delta: "+12 this month" },
  { label: "Revenue (Nov)", value: "₦1.84M", delta: "+8.3% vs Oct" },
  { label: "Check-ins today", value: "43", delta: "Peak 6–8am" },
  { label: "Renewals due", value: "14", delta: "Next 7 days", warn: true },
];

const bars = [38, 52, 44, 61, 57, 70, 66, 78, 72, 85, 80, 94];

const checkins = [
  { name: "Amaka Okonkwo", meta: "Lekki · 7:42am", initials: "AO" },
  { name: "Chidi Balogun", meta: "Yaba · 7:31am", initials: "CB" },
  { name: "Funke Adeyemi", meta: "Lekki · 7:18am", initials: "FA" },
  { name: "Tunde Bakare", meta: "Lekki · 6:55am", initials: "TB" },
];

/** Static, always-dark illustration of the gym-admin dashboard. */
export function ProductMock() {
  return (
    <div className="dark relative rounded-2xl border border-white/10 bg-[oklch(0.15_0.005_60)] p-1.5 text-left shadow-[0_40px_120px_-30px_color-mix(in_oklch,var(--primary)_45%,transparent),0_30px_60px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/5">
      {/* window chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <div className="mx-auto hidden rounded-md bg-white/5 px-10 py-1 font-mono text-[10px] text-white/40 sm:block">
          EngineRoom · Gym admin
        </div>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-white/5 bg-[oklch(0.12_0.005_60)]">
        {/* sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-white/5 p-3 md:flex">
          <div className="mb-4 px-2 font-heading text-sm font-extrabold tracking-tight text-white">
            Iron<span className="text-primary-text">House</span> Gym
          </div>
          {sidebar.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
                active ? "bg-primary/15 font-semibold text-white" : "text-white/45"
              }`}
            >
              <Icon className={`size-3.5 ${active ? "text-primary-text" : ""}`} />
              {label}
            </div>
          ))}
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-white/40">Good morning, Bola</div>
              <div className="font-heading text-base font-bold tracking-tight text-white">
                Today at a glance
              </div>
            </div>
            <div className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
              + Add member
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <div className="text-[10px] tracking-wide text-white/40 uppercase">{s.label}</div>
                <div className="mt-1.5 font-heading text-xl font-extrabold tracking-tight text-white">
                  {s.value}
                </div>
                <div className={`mt-1 text-[10px] ${s.warn ? "text-amber-400" : "text-white/50"}`}>
                  {s.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid gap-2.5 lg:grid-cols-5">
            {/* revenue chart */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-white/80">Revenue · last 12 weeks</div>
                <div className="flex items-center gap-1 text-[10px] text-primary">
                  <TrendingUp className="size-3" /> 24%
                </div>
              </div>
              <div className="flex h-28 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-[3px] ${
                      i === bars.length - 1 ? "bg-primary" : "bg-primary/30"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* live check-ins */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-white/80">Live check-ins</div>
                <span className="flex items-center gap-1.5 text-[10px] text-white/40">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                  </span>
                  Live
                </span>
              </div>
              <ul className="space-y-1.5">
                {checkins.map((c) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[9px] font-bold text-primary-text">
                      {c.initials}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] text-white/85">{c.name}</span>
                    <span className="text-[10px] text-white/35">{c.meta}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* floating toasts */}
      <div className="absolute -top-5 -right-3 hidden items-center gap-2.5 rounded-xl border border-white/10 bg-[oklch(0.18_0.005_60)]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:flex lg:-right-8 motion-safe:animate-[float_6s_ease-in-out_infinite]">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/15">
          <CreditCard className="size-3.5 text-primary" />
        </span>
        <div>
          <div className="text-[11px] font-semibold text-white">₦25,000 received</div>
          <div className="text-[10px] text-white/45">Monthly plan · via Paystack</div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-xl border border-white/10 bg-[oklch(0.18_0.005_60)]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur sm:flex lg:-left-8 motion-safe:animate-[float_6s_ease-in-out_3s_infinite]">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/15">
          <CalendarCheck className="size-3.5 text-primary-text" />
        </span>
        <div>
          <div className="text-[11px] font-semibold text-white">Renewal reminder sent</div>
          <div className="text-[10px] text-white/45">14 members · expiring in 7 days</div>
        </div>
      </div>
    </div>
  );
}
