"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@adaptsec/shared";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      await apiClient.post("/api/v1/auth/login", values);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerError(err.message);
      } else {
        setServerError("Unable to reach authentication service.");
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
            Sign in to your workspace
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Enter your work email and password to continue.
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
                htmlFor="email"
                className="block text-xs font-medium text-ink-primary mb-1"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink-primary focus:border-brand focus:outline-none"
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-risk-high">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-ink-primary"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
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
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-ink-secondary">
            Need an organization workspace?{" "}
            <Link href="/register" className="font-medium text-brand hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
