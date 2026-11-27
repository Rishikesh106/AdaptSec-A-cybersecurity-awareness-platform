"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Role } from "@/lib/types";

export const DEMO_USERS: UserProfile[] = [
  {
    id: "usr-learner",
    email: "learner@adaptsec.io",
    name: "Alex Mercer",
    role: "LEARNER",
    department: "Engineering",
    organizationName: "Acme Cyber Defense Corp",
    xp: 2450,
    level: 3,
    streakDays: 5,
    humanRiskScore: 38,
    skillsMastery: {
      phishing: 64,
      credentials: 72,
      payments: 58,
      social_eng: 62,
      browsing_wifi: 68,
      data_privacy: 74,
      incident_response: 60,
    },
    cyberRankTitle: "Threat Hunter",
    createdAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "usr-admin",
    email: "admin@adaptsec.io",
    name: "Priya Sundaram",
    role: "ORG_ADMIN",
    department: "Security Operations",
    organizationName: "Acme Cyber Defense Corp",
    xp: 8900,
    level: 7,
    streakDays: 14,
    humanRiskScore: 16,
    skillsMastery: {
      phishing: 92,
      credentials: 88,
      payments: 85,
      social_eng: 80,
      browsing_wifi: 88,
      data_privacy: 90,
      incident_response: 95,
    },
    cyberRankTitle: "Cyber Defense Vanguard",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "usr-author",
    email: "author@adaptsec.io",
    name: "Marcus Vance",
    role: "AUTHOR",
    department: "Curriculum & Threat Intel",
    organizationName: "Acme Cyber Defense Corp",
    xp: 5200,
    level: 5,
    streakDays: 8,
    humanRiskScore: 24,
    skillsMastery: {
      phishing: 85,
      credentials: 80,
      payments: 78,
      social_eng: 84,
      browsing_wifi: 82,
      data_privacy: 86,
      incident_response: 80,
    },
    cyberRankTitle: "Security Specialist",
    createdAt: "2026-08-10T00:00:00Z",
  },
  {
    id: "usr-superadmin",
    email: "superadmin@adaptsec.io",
    name: "Elena Rostova",
    role: "SUPER_ADMIN",
    department: "Executive Leadership",
    organizationName: "Acme Cyber Defense Corp",
    xp: 15400,
    level: 10,
    streakDays: 32,
    humanRiskScore: 11,
    skillsMastery: {
      phishing: 98,
      credentials: 94,
      payments: 92,
      social_eng: 90,
      browsing_wifi: 95,
      data_privacy: 96,
      incident_response: 98,
    },
    cyberRankTitle: "Chief Cyber Sentinel",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: Role) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  addXp: (amount: number) => void;
  updateSkillScore: (skillTag: string, newScore: number) => void;
  completedScenarioIds: string[];
  markScenarioCompleted: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>([]);

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem("adaptsec-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("adaptsec-theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  const switchRole = (role: Role) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) setCurrentUser(found);
  };

  const addXp = (amount: number) => {
    setCurrentUser((prev) => {
      const nextXp = prev.xp + amount;
      const nextLevel = Math.floor(nextXp / 1000) + 1;
      return { ...prev, xp: nextXp, level: nextLevel };
    });
  };

  const updateSkillScore = (skillTag: string, newScore: number) => {
    setCurrentUser((prev) => {
      const nextSkills = { ...prev.skillsMastery, [skillTag]: newScore };
      // Recalculate human risk score
      const scores = Object.values(nextSkills);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const nextRisk = Math.max(5, Math.min(95, Math.round(100 - avg)));
      return {
        ...prev,
        skillsMastery: nextSkills,
        humanRiskScore: nextRisk,
      };
    });
  };

  const markScenarioCompleted = (id: string) => {
    setCompletedScenarioIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        theme,
        toggleTheme,
        addXp,
        updateSkillScore,
        completedScenarioIds,
        markScenarioCompleted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
