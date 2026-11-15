import { SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Register your gym",
    desc: "Tell us your gym's name, contact details and address. It takes a couple of minutes.",
  },
  {
    title: "Get verified",
    desc: "We review every new gym before it goes live, so the platform stays free of spam accounts.",
  },
  {
    title: "Set up plans & team",
    desc: "Create membership plans, add branches if you have them, and invite trainers and staff.",
  },
  {
    title: "Go live",
    desc: "Add your members, print your check-in QR code, and let renewals and reminders run themselves.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="From sign-up to first check-in." />

        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            aria-hidden
            className="absolute top-5 right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-primary/60 via-border to-border lg:block"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative text-center lg:px-2">
              <span className="relative mx-auto grid size-10 place-items-center rounded-full border border-primary/30 bg-background font-heading text-sm font-extrabold text-primary-text shadow-[0_0_0_6px_var(--background)]">
                {i + 1}
              </span>
              <h3 className="mt-5 font-heading text-lg font-bold tracking-tight text-foreground">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
