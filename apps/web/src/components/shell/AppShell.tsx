"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthUserDTO } from "@adaptsec/shared";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Building2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Crosshair,
  HelpCircle,
  ClipboardCheck,
  Shield,
  Trophy,
  Award,
  AlertTriangle,
  BarChart3,
  Megaphone,
  Settings,
  PenTool,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumb?: string;
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<{ user: AuthUserDTO }>("/api/v1/auth/me"),
  });

  const switchOrgMutation = useMutation({
    mutationFn: (organizationId: string) =>
      apiClient.post("/api/v1/auth/switch-org", { organizationId }),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      notify("Switched active organization", "success");
    },
    onError: (err: Error) => {
      notify(err.message, "error");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post("/api/v1/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="rounded-lg border border-border bg-surface px-5 py-3 text-sm text-ink-secondary shadow-card">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-lg border border-border bg-surface p-6 shadow-card space-y-4">
          <h1 className="text-base font-semibold text-ink-primary">
            Session required
          </h1>
          <p className="text-sm text-ink-secondary">
            Sign in to access your organization workspace.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const user = data.user;
  const isAdmin =
    user.activeRole === "ORG_ADMIN" || user.activeRole === "SUPER_ADMIN";
  const isAuthor = isAdmin || user.activeRole === "CONTENT_AUTHOR";

  const navGroups = [
    {
      label: "Workspace",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/tracks", label: "Learning Paths", icon: BookOpen },
        { href: "/simulations", label: "Simulations", icon: Crosshair },
        { href: "/quiz", label: "Adaptive Quiz", icon: HelpCircle },
        { href: "/games", label: "Training Labs", icon: Shield },
        { href: "/baseline", label: "Baseline Assessment", icon: ClipboardCheck },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        { href: "/certificates", label: "Certificates", icon: Award },
        { href: "/threat-feed", label: "Scam Feed", icon: AlertTriangle },
        { href: "/sessions", label: "Active Sessions", icon: KeyRound },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
    ...(isAuthor
      ? [
          {
            label: "Administration",
            items: [
              ...(isAdmin
                ? [
                    { href: "/admin", label: "Risk Analytics", icon: BarChart3 },
                    { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
                    { href: "/team", label: "Team & Invites", icon: Users },
                  ]
                : []),
              { href: "/author", label: "Content Studio", icon: PenTool },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="h-14 px-4 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" strokeWidth={1.75} />
          <span className="font-semibold text-[15px] tracking-tight text-ink-primary">
            AdaptSec
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-brand-tint text-brand"
                        : "text-ink-secondary hover:bg-subtle hover:text-ink-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border text-xs text-ink-muted">
          <div className="font-medium text-ink-primary truncate">{user.name}</div>
          <div className="truncate">{user.email}</div>
          <div className="mt-1 inline-block rounded bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary">
            {user.activeRole}
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span>{user.activeOrganizationName}</span>
            {breadcrumb && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-ink-primary">{breadcrumb}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Org Switcher */}
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
              <select
                aria-label="Switch organization"
                value={user.activeOrganizationId}
                onChange={(e) => switchOrgMutation.mutate(e.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-primary focus:border-brand focus:outline-none"
              >
                {user.memberships.map((m) => (
                  <option key={m.organizationId} value={m.organizationId}>
                    {m.organizationName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary hover:bg-subtle hover:text-ink-primary transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
