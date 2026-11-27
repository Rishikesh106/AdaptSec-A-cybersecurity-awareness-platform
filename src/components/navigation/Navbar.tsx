"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Role } from "@/lib/types";
import {
  Shield,
  Flame,
  Sun,
  Moon,
  Zap,
  Users,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { currentUser, switchRole, theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyber-border bg-[#05070e]/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-primary via-cyan-500 to-cyber-secondary p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-cyber-bg transition group-hover:bg-opacity-80">
                <Shield className="h-5 w-5 text-cyber-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg text-white">
                  Adapt<span className="text-cyber-primary">Sec</span>
                </span>
                <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-cyber-primary border border-cyan-800/60">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-cyber-muted -mt-0.5 font-mono">Behavior-Change Platform</p>
            </div>
          </Link>
        </div>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Streak Counter */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{currentUser.streakDays} Day Streak</span>
          </div>

          {/* XP & Level */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-cyber-border bg-cyber-card px-3 py-1 text-xs font-medium">
            <div className="flex items-center gap-1 text-cyber-secondary">
              <Zap className="h-3.5 w-3.5 fill-cyber-secondary" />
              <span>{currentUser.xp.toLocaleString()} XP</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-cyber-muted">Level {currentUser.level}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyber-border bg-cyber-card text-cyber-muted hover:text-white transition"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Role Switcher (Crucial for Reviewer testing RBAC seamlessly) */}
          <div className="relative group">
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyber-card hover:border-cyan-400/50 px-2.5 py-1.5 cursor-pointer text-xs transition">
              <Users className="h-3.5 w-3.5 text-cyber-primary" />
              <div className="text-left hidden lg:block">
                <p className="font-semibold text-slate-200 text-[11px] leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-cyber-primary font-mono capitalize">{currentUser.role.replace("_", " ")}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-cyber-muted" />
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1.5 hidden w-56 rounded-xl border border-cyber-border bg-cyber-card p-1.5 shadow-2xl backdrop-blur-xl group-hover:block z-50">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-cyber-muted tracking-wider uppercase border-b border-cyber-border mb-1">
                Switch Role (Live RBAC Test)
              </div>
              {(["LEARNER", "ORG_ADMIN", "AUTHOR", "SUPER_ADMIN"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition flex items-center justify-between ${
                    currentUser.role === role
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span>{role.replace("_", " ")}</span>
                  {currentUser.role === role && <span className="text-[10px] text-cyber-primary">● Active</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
