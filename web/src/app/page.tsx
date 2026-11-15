import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Roles } from "@/components/landing/roles";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  if (host.startsWith("gym.")) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    switch (profile?.role) {
      case "platform_admin":
      case "platform_staff":
        redirect("/super-admin");
      case "gym_admin":
      case "second_admin":
      case "front_desk":
      case "accountant":
        redirect("/gym-admin");
      case "trainer":
        redirect("/trainer");
      case "member":
        redirect("/member");
      default:
        redirect("/login");
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-background">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <Features />
        <Roles />
        <HowItWorks />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
