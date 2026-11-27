"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Target,
  GraduationCap,
  Gamepad2,
  HelpCircle,
  Building2,
  PenTool,
  Award,
  Radio,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useApp();

  const isOrgAdminOrHigher =
    currentUser.role === "ORG_ADMIN" || currentUser.role === "SUPER_ADMIN";
  const isAuthorOrHigher =
    currentUser.role === "AUTHOR" || currentUser.role === "SUPER_ADMIN" || currentUser.role === "ORG_ADMIN";

  const navItems = [
    {
      label: "Learner Portal",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/simulations", label: "Attack Simulations", icon: Target, badge: "68 Sims" },
        { href: "/tracks", label: "Learning Paths", icon: GraduationCap },
        { href: "/games", label: "Gamified Labs", icon: Gamepad2, badge: "4 Games" },
        { href: "/quiz", label: "Adaptive Quiz", icon: HelpCircle },
        { href: "/threat-feed", label: "Scam of the Week", icon: Radio },
        { href: "/certificates", label: "Certificates", icon: Award },
      ],
    },
    ...(isOrgAdminOrHigher
      ? [
          {
            label: "Enterprise Admin",
            items: [
              { href: "/admin", label: "Risk Analytics", icon: Building2 },
              { href: "/admin/campaigns", label: "Campaign Drives", icon: ShieldAlert },
            ],
          },
        ]
      : []),
    ...(isAuthorOrHigher
      ? [
          {
            label: "Content Studio",
            items: [
              { href: "/author", label: "Scenario Authoring", icon: PenTool },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-cyber-border bg-[#05070e]/60 backdrop-blur-md p-4">
      <nav className="flex-1 space-y-6">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-cyber-muted font-mono">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 font-semibold border-l-2 border-cyber-primary"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-cyber-primary" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-bold text-cyber-primary border border-cyan-800/40">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Human Risk Profile Quick Card in Sidebar */}
      <div className="mt-auto rounded-xl border border-cyber-border bg-cyber-card p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-cyber-muted">Human Risk Score</span>
          <span className={`text-xs font-bold ${
            currentUser.humanRiskScore <= 25 ? "text-emerald-400" : currentUser.humanRiskScore <= 50 ? "text-amber-400" : "text-rose-400"
          }`}>
            {currentUser.humanRiskScore}/100
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all ${
              currentUser.humanRiskScore <= 25
                ? "bg-emerald-400"
                : currentUser.humanRiskScore <= 50
                ? "bg-amber-400"
                : "bg-rose-500"
            }`}
            style={{ width: `${currentUser.humanRiskScore}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-cyber-muted font-mono">
          Rank: <span className="text-white font-semibold">{currentUser.cyberRankTitle}</span>
        </p>
      </div>
    </aside>
  );
}
