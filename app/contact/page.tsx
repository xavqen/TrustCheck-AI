import { FeedbackForm } from "@/components/forms/feedback-form";

export default function ContactPage() {
  return (
    <section className="container-px mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 text-muted-foreground">Send feedback, bug reports or partnership requests.</p>
      <div className="mt-8"><FeedbackForm /></div>
    </section>
  );
}
