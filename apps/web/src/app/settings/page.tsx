"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shell/AppShell";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/components/providers/QueryProvider";
import { Download, Save, Trash2, Building2, User } from "lucide-react";

interface SettingsResponse {
  profile: {
    id: string;
    email: string;
    name: string;
    department: string;
    role: string;
    notificationPrefs: {
      emailReminders?: boolean;
      weeklyDigest?: boolean;
      scamAlerts?: boolean;
    };
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    settingsJson: {
      passThreshold?: number;
      mfaEnforcementPolicy?: "OPTIONAL" | "RECOMMENDED" | "REQUIRED";
      campaignDefaultDays?: number;
    };
  } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SettingsPage() {
  const { notify } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SettingsResponse>({
    queryKey: ["user-settings"],
    queryFn: () => apiClient.get("/api/v1/settings"),
  });

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [scamAlerts, setScamAlerts] = useState(true);

  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [passThreshold, setPassThreshold] = useState(75);
  const [mfaPolicy, setMfaPolicy] = useState<"OPTIONAL" | "RECOMMENDED" | "REQUIRED">("RECOMMENDED");
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.profile.name);
    setDepartment(data.profile.department);
    setEmailReminders(data.profile.notificationPrefs?.emailReminders ?? true);
    setWeeklyDigest(data.profile.notificationPrefs?.weeklyDigest ?? true);
    setScamAlerts(data.profile.notificationPrefs?.scamAlerts ?? true);
    if (data.organization) {
      setOrgName(data.organization.name);
      setOrgDomain(data.organization.domain ?? "");
      setPassThreshold(data.organization.settingsJson?.passThreshold ?? 75);
      setMfaPolicy(data.organization.settingsJson?.mfaEnforcementPolicy ?? "RECOMMENDED");
    }
  }, [data]);

  const profileMutation = useMutation({
    mutationFn: () =>
      apiClient.patch("/api/v1/settings/profile", {
        name,
        department,
        notificationPrefs: { emailReminders, weeklyDigest, scamAlerts },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      notify("Profile and notification preferences saved", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Failed to save profile", "error"),
  });

  const orgMutation = useMutation({
    mutationFn: () =>
      apiClient.patch("/api/v1/settings/org", {
        name: orgName,
        domain: orgDomain || null,
        settingsJson: { passThreshold, mfaEnforcementPolicy: mfaPolicy },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      notify("Organization settings updated", "success");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Failed to update organization", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiClient.delete("/api/v1/settings/account", { confirmEmail }),
    onSuccess: () => {
      notify("Account deleted", "info");
      router.push("/");
    },
    onError: (err) =>
      notify(err instanceof ApiClientError ? err.message : "Unable to delete account", "error"),
  });

  const handleDataExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/settings/data-export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "adaptsec-my-data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify("Personal data archive downloaded", "success");
    } catch {
      notify("Failed to export personal data", "error");
    }
  };

  return (
    <AppShell breadcrumb="Settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-primary">
            Account & Workspace Settings
          </h1>
          <p className="text-sm text-ink-secondary">
            Manage your profile, notification preferences, organization policies, and data rights.
          </p>
        </div>

        {isLoading || !data ? (
          <div className="h-40 animate-pulse rounded-md border border-border bg-surface" />
        ) : (
          <>
            {/* Profile & Notifications */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                profileMutation.mutate();
              }}
              className="rounded-md border border-border bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
                <User className="h-4 w-4 text-brand" />
                <span>Profile & Notifications</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-1 text-sm text-ink-primary">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={emailReminders}
                    onChange={(e) => setEmailReminders(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Campaign deadline reminders</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Weekly skill mastery digest</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scamAlerts}
                    onChange={(e) => setScamAlerts(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Scam of the Week threat advisories</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {profileMutation.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>

            {/* Org Settings (Admin Only) */}
            {data.organization && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  orgMutation.mutate();
                }}
                className="rounded-md border border-border bg-surface p-5 space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-primary">
                  <Building2 className="h-4 w-4 text-brand" />
                  <span>Organization Governance</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Verified Domain
                    </label>
                    <input
                      type="text"
                      value={orgDomain}
                      onChange={(e) => setOrgDomain(e.target.value)}
                      placeholder="company.com"
                      className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      Certification Pass Threshold (%)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={passThreshold}
                      onChange={(e) => setPassThreshold(Number(e.target.value))}
                      className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-secondary mb-1">
                      MFA Policy Guidance
                    </label>
                    <select
                      value={mfaPolicy}
                      onChange={(e) =>
                        setMfaPolicy(e.target.value as typeof mfaPolicy)
                      }
                      className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink-primary"
                    >
                      <option value="OPTIONAL">Optional</option>
                      <option value="RECOMMENDED">Recommended</option>
                      <option value="REQUIRED">Required</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={orgMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {orgMutation.isPending ? "Saving..." : "Save Organization"}
                  </button>
                </div>
              </form>
            )}

            {/* Data Export & Account Deletion */}
            <div className="rounded-md border border-border bg-surface p-5 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-ink-primary">
                    Personal Data Export (DPDP / GDPR)
                  </h2>
                  <p className="text-xs text-ink-secondary">
                    Download a JSON archive of your profile, skill mastery, attempts, and certificates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDataExport}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-canvas px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-subtle"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export My Data (JSON)
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-red-700">
                  Delete Account
                </h2>
                <p className="text-xs text-ink-secondary">
                  Permanently delete your user account and associated telemetry. Type{" "}
                  <span className="font-mono font-medium">{data.profile.email}</span>{" "}
                  to confirm.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={data.profile.email}
                    className="flex-1 rounded-md border border-red-200 bg-canvas px-3 py-2 text-sm text-ink-primary"
                  />
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate()}
                    disabled={
                      deleteMutation.isPending ||
                      confirmEmail.toLowerCase() !==
                        data.profile.email.toLowerCase()
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
