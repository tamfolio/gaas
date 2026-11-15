import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";

const faqs = [
  {
    q: "Do my members need to download an app?",
    a: "No. EngineRoom runs in any phone browser and can be added to the home screen like a normal app — no app store, no updates to chase.",
  },
  {
    q: "How do members pay?",
    a: "Members can renew online through Paystack using card, bank transfer or USSD. Your front desk can also record cash and POS payments manually, so every naira is in one place.",
  },
  {
    q: "What happens after I register?",
    a: "Our team reviews your registration before your gym goes live. Once you're approved you can sign in, set up plans and start adding members.",
  },
  {
    q: "Can I run more than one branch?",
    a: "Yes. Turn on branches in Settings to get a separate check-in QR code per location, and choose whether each membership plan covers one branch or all of them.",
  },
  {
    q: "Can I limit what my staff can see?",
    a: "Yes. Invite a second admin, front-desk staff or an accountant — each role only sees the parts of the dashboard it needs.",
  },
  {
    q: "Is my gym's data kept separate?",
    a: "Yes. Every gym's members, payments and records are isolated from every other gym on the platform.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered."
          desc="Anything else? Sign in or register and reach out — we'll help you get set up."
          className="lg:mx-0 lg:max-w-md lg:text-left"
        />

        <div className="divide-y divide-border rounded-3xl border border-border bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-foreground">
                {f.q}
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="-mt-1 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
