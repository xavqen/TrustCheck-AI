"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { feedbackSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const form = useForm<FormValues>({ resolver: zodResolver(feedbackSchema), defaultValues: { email: "", message: "", rating: 5 } });
  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) return toast.error(data.error || "Could not send feedback");
    toast.success("Feedback sent");
    form.reset();
  };
  return <Card><CardContent className="p-6"><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <div className="space-y-2"><Label>Email</Label><Input type="email" {...form.register("email")} placeholder="you@example.com" /></div>
    <div className="space-y-2"><Label>Rating</Label><Input type="number" min={1} max={5} {...form.register("rating")} /></div>
    <div className="space-y-2"><Label>Message</Label><Textarea {...form.register("message")} placeholder="Tell us what to improve..." />{form.formState.errors.message ? <p className="text-sm text-red-600">{form.formState.errors.message.message}</p> : null}</div>
    <Button disabled={form.formState.isSubmitting} className="w-full">Send feedback</Button>
  </form></CardContent></Card>;
}
