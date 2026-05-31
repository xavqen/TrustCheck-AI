import type { Metadata } from "next";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up and test the complete TrustCheck AI scam detection workflow."
};

export default function OnboardingPage() {
  return (
    <section className="container-px mx-auto max-w-7xl py-10 sm:py-12">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Onboarding</h1>
        <p className="mt-3 text-muted-foreground">A quick product checklist for users, admins and Business API customers.</p>
      </div>
      <OnboardingChecklist />
    </section>
  );
}
