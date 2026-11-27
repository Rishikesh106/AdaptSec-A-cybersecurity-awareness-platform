"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@adaptsec/shared";
import { apiClient } from "@/lib/api-client";
import { AppShell } from "@/components/shell/AppShell";
import { useToast } from "@/components/providers/QueryProvider";

interface MembershipRow {
  id: string;
  role: Role;
  department: string;
  status: string;
  user: {
    id: string;
    email: string;
    name: string;
    xp: number;
    emailVerified: boolean;
  };
}

interface InviteRow {
  id: string;
  email: string;
  role: Role;
  department: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("LEARNER");
  const [inviteDept, setInviteDept] = useState("Engineering");

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["memberships", search],
    queryFn: () =>
      apiClient.get<{ items: MembershipRow[] }>(
        `/api/v1/memberships?search=${encodeURIComponent(search)}`
      ),
  });

  const { data: invitesData } = useQuery({
    queryKey: ["invites"],
    queryFn: () => apiClient.get<{ items: InviteRow[] }>("/api/v1/invites"),
  });

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: Role; department: string }) =>
      apiClient.post("/api/v1/invites", payload),
    onSuccess: () => {
      setInviteEmail("");
      void queryClient.invalidateQueries({ queryKey: ["invites"] });
      notify("Invitation sent", "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      apiClient.patch(`/api/v1/memberships/${id}`, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memberships"] });
      notify("Role updated", "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/invites/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invites"] });
      notify("Invitation revoked", "success");
    },
    onError: (err: Error) => notify(err.message, "error"),
  });

  return (
    <AppShell breadcrumb="Team & Invites">
      <div className="space-y-6">
        <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink-primary">
              Organization Members & Invitations
            </h1>
            <p className="text-sm text-ink-secondary">
              Manage role-based access control and invite employees to your organization.
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or email..."
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none w-64"
          />
        </div>

        {/* Invite Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate({
              email: inviteEmail,
              role: inviteRole,
              department: inviteDept,
            });
          }}
          className="rounded-lg border border-border bg-surface p-4 shadow-card flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="invite-email"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Invite colleague by email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="invite-dept"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Department
            </label>
            <input
              id="invite-dept"
              type="text"
              required
              value={inviteDept}
              onChange={(e) => setInviteDept(e.target.value)}
              className="w-36 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="block text-xs font-medium text-ink-primary mb-1"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
            >
              <option value="LEARNER">LEARNER</option>
              <option value="CONTENT_AUTHOR">CONTENT_AUTHOR</option>
              <option value="ORG_ADMIN">ORG_ADMIN</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {inviteMutation.isPending ? "Sending..." : "Send invite"}
          </button>
        </form>

        {/* Members Table */}
        <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-sm font-semibold text-ink-primary">
            Active Members ({membersData?.items.length ?? 0})
          </div>
          {membersLoading ? (
            <div className="p-6 text-sm text-ink-secondary">
              Loading members...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {membersData?.items.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 px-4 font-medium text-ink-primary">
                      {m.user.name}
                    </td>
                    <td className="py-2.5 px-4 text-ink-secondary">
                      {m.user.email}
                    </td>
                    <td className="py-2.5 px-4 text-ink-secondary">
                      {m.department}
                    </td>
                    <td className="py-2.5 px-4">
                      <select
                        aria-label={`Role for ${m.user.name}`}
                        value={m.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            id: m.id,
                            role: e.target.value as Role,
                          })
                        }
                        className="rounded border border-border bg-surface px-2 py-1 text-xs text-ink-primary"
                      >
                        <option value="LEARNER">LEARNER</option>
                        <option value="CONTENT_AUTHOR">CONTENT_AUTHOR</option>
                        <option value="ORG_ADMIN">ORG_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-ink-secondary">
                      {m.user.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending Invites */}
        {invitesData && invitesData.items.length > 0 && (
          <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-sm font-semibold text-ink-primary">
              Invitations
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-canvas text-xs font-medium text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitesData.items.map((inv) => {
                  const status = inv.acceptedAt
                    ? "Accepted"
                    : inv.revokedAt
                    ? "Revoked"
                    : "Pending";
                  return (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-4 text-ink-primary">{inv.email}</td>
                      <td className="py-2.5 px-4 text-ink-secondary">
                        {inv.department}
                      </td>
                      <td className="py-2.5 px-4 text-ink-secondary">{inv.role}</td>
                      <td className="py-2.5 px-4 text-xs font-medium">{status}</td>
                      <td className="py-2.5 px-4 text-right">
                        {status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => revokeInviteMutation.mutate(inv.id)}
                            className="text-xs font-medium text-risk-high hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
