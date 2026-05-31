"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { mode: "login" | "signup" };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const schema = mode === "signup" ? signupSchema : loginSchema;
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: mode === "signup" ? { name: "", email: "", password: "" } as Values : { email: "", password: "" } as Values });

  const onSubmit = async (values: Values) => {
    if (mode === "signup") {
      const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error || "Signup failed");
      toast.success("Account created");
    }
    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) return toast.error("Invalid email or password");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="container-px mx-auto grid min-h-[70vh] max-w-md place-items-center py-10">
      <Card className="w-full">
        <CardHeader><CardTitle>{mode === "signup" ? "Create account" : "Login"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "signup" ? <Field label="Name" error={(form.formState.errors as { name?: { message?: string } }).name?.message}><Input {...form.register("name" as never)} /></Field> : null}
            <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email" as never)} /></Field>
            <Field label="Password" error={form.formState.errors.password?.message}><Input type="password" {...form.register("password" as never)} /></Field>
            <Button disabled={form.formState.isSubmitting} className="w-full">{mode === "signup" ? "Sign up" : "Login"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "New here? "}
            <Link className="font-medium text-primary" href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Login" : "Create account"}</Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-red-600">{error}</p> : null}</div>;
}
