"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@adaptsec/shared";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { department: "Security" },
  });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    try {
      await apiClient.post("/api/v1/auth/register", values);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError("Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck className="h-6 w-6 text-brand" strokeWidth={1.75} />
          <span className="text-lg font-semibold text-ink-primary tracking-tight">
            AdaptSec
          </span>
        </div>

        <div className="rounded-lg border border-border bg-surface p-8 shadow-card">
          <h1 className="text-xl font-semibold text-ink-primary">
            Create organization workspace
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Start running security awareness simulations for your team.
          </p>

          {serverError && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-risk-high"
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-ink-primary mb-1"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-risk-high">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-ink-primary mb-1"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-risk-high">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="organizationName"
                className="block text-xs font-medium text-ink-primary mb-1"
              >
                Organization name
              </label>
              <input
                id="organizationName"
                type="text"
                {...register("organizationName")}
                placeholder="e.g., Meridian Logistics Pvt Ltd"
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-ink-primary mb-1"
              >
                Password (min 10 characters)
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-risk-high">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Creating workspace..." : "Create workspace"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-ink-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
