"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Users as UsersIcon,
  Info,
} from "lucide-react";
import { usersApi } from "@/lib/adminApi";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/components/admin/AuthProvider";
import { DrawerShell, DeleteDialog, Section, TextField, Toggle } from "@/components/admin/cms/FormKit";

// Admin → Users (Super Admin only; the backend enforces this too).
// Create dashboard accounts, pick a role (which pre-fills access), then adjust
// each person's access per section: No access / View / Manage.

const ROLE_BADGE = {
  super_admin: "bg-red-50 text-brand ring-red-200",
  admin: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  editor: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  viewer: "bg-slate-100 text-slate-600 ring-slate-200",
};

const LEVEL_LABELS = { none: "No access", view: "View", manage: "Manage" };

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${ROLE_BADGE[role] || ROLE_BADGE.viewer}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

/** One-line summary of an account's access for the table. */
function accessSummary(u, modules) {
  if (u.role === "super_admin") return "Full access + manages accounts";
  if (!u.accessConfigured) return "Full access (not yet configured)";
  const levels = modules.map((m) => u.permissions?.[m.key] || "none");
  const manage = levels.filter((l) => l === "manage").length;
  const view = levels.filter((l) => l === "view").length;
  if (manage === modules.length) return "Manage all sections";
  if (view === modules.length) return "View all sections";
  if (!manage && !view) return "No access";
  return [manage && `Manage ${manage}`, view && `View ${view}`].filter(Boolean).join(" · ") + ` of ${modules.length}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { user: me } = useAuth();
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, row = edit
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [metaRes, listRes] = await Promise.all([meta ? Promise.resolve({ data: meta }) : usersApi.meta(), usersApi.list()]);
      setMeta(metaRes.data);
      setRows(listRes.data || []);
    } catch (e) {
      setError(e.message || "Could not load accounts.");
    } finally {
      setLoading(false);
    }
  }, [meta]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = meta?.modules || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard accounts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create accounts and choose what each person can see and change.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setEditing({})}
            disabled={!meta}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> Add account
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading && !rows.length ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading accounts…
          </div>
        ) : !rows.length ? (
          <div className="py-16 text-center text-slate-400">
            <UsersIcon className="mx-auto h-8 w-8 mb-2" /> No accounts yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Access</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Last sign-in</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((u) => {
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 align-middle">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">
                          {u.name}
                          {isMe && <span className="ml-2 text-xs font-medium text-slate-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3 text-slate-600">
                        {accessSummary(u, modules)}
                      </td>
                      <td className="px-5 py-3">
                        {u.isActive ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">Active</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200">Deactivated</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditing(u)}
                            aria-label={`Edit ${u.name}`}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => setDeleting(u)}
                              aria-label={`Delete ${u.name}`}
                              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && meta && (
        <AccountDrawer
          meta={meta}
          editing={editing.id ? editing : null}
          isMe={editing.id === me?.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleting && (
        <DeleteDialog
          title={`Delete ${deleting.name}?`}
          description="Their account is removed and they can no longer sign in. This can't be undone. To block someone temporarily, deactivate them instead."
          onConfirm={async () => {
            await usersApi.remove(deleting.id);
            load();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

// ── Add / edit account ──────────────────────────────────────────────────────

function AccountDrawer({ meta, editing, isMe, onClose, onSaved }) {
  const isEdit = !!editing;
  const [name, setName] = useState(editing?.name || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(editing?.role || "editor");
  const [isActive, setIsActive] = useState(editing?.isActive ?? true);
  const [perms, setPerms] = useState(() =>
    editing && editing.role !== "super_admin" ? { ...editing.permissions } : { ...(meta.presets.editor || {}) }
  );
  const [roleNote, setRoleNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fe, setFe] = useState({});

  const isSuper = role === "super_admin";
  const legacy = isEdit && !editing.accessConfigured && editing.role !== "super_admin";

  const pickRole = (r) => {
    if (r === role) return;
    setRole(r);
    if (r !== "super_admin") {
      setPerms({ ...(meta.presets[r] || {}) });
      setRoleNote(`Access reset to the ${ROLE_LABELS[r]} defaults. You can adjust it below.`);
    } else {
      setRoleNote("");
    }
  };

  const setAll = (level) => setPerms(Object.fromEntries(meta.modules.map((m) => [m.key, level])));
  const levelOf = (key) => perms[key] || "none";

  const counts = useMemo(() => {
    const levels = meta.modules.map((m) => perms[m.key] || "none");
    return { manage: levels.filter((l) => l === "manage").length, view: levels.filter((l) => l === "view").length };
  }, [perms, meta.modules]);

  const save = async () => {
    setSaving(true);
    setError("");
    setFe({});
    const body = { name: name.trim(), email: email.trim(), role, isActive };
    if (!isSuper) {
      // Only send sections with access; missing = no access.
      body.permissions = Object.fromEntries(Object.entries(perms).filter(([, l]) => l === "view" || l === "manage"));
    }
    if (password) body.password = password;
    if (isMe) {
      // You can't change your own role or deactivate yourself (the server blocks it too).
      delete body.role;
      delete body.isActive;
      delete body.permissions;
    }
    try {
      if (isEdit) await usersApi.update(editing.id, body);
      else await usersApi.create(body);
      onSaved();
    } catch (e) {
      const fields = e?.body?.error?.fields;
      if (fields && typeof fields === "object") setFe(fields);
      setError(e.message || "Could not save the account.");
      setSaving(false);
    }
  };

  return (
    <DrawerShell
      title={isEdit ? editing.name : "Add account"}
      subtitle={isEdit ? "Edit account" : "New dashboard account"}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} disabled={saving} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create account"}
          </button>
        </>
      }
    >
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {legacy && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This account was created before access control and currently has full access. Saving applies the access below.
          </span>
        </div>
      )}

      <Section title="Account details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Full name" required value={name} onChange={setName} error={fe.name} placeholder="e.g. Sarah Tan" />
          <TextField label="Email" required type="email" value={email} onChange={setEmail} error={fe.email} placeholder="name@globalatd.com" />
        </div>
        <TextField
          label={isEdit ? "New password" : "Password"}
          required={!isEdit}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fe.password}
          hint={isEdit ? "Leave blank to keep their current password. At least 8 characters." : "At least 8 characters. Share it with them securely; they can change it after signing in."}
        />
        {!isMe && (
          <div className="max-w-xs">
            <Toggle label="Status" value={isActive} onChange={setIsActive} onText="Active (can sign in)" offText="Deactivated" />
          </div>
        )}
      </Section>

      <Section title="Role" description="A role fills in a starting set of access. You can then change any section below.">
        {isMe ? (
          <p className="text-sm text-slate-500">
            You&apos;re signed in as this account, so you can&apos;t change its role. <RoleBadge role={role} />
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meta.roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pickRole(r)}
                className={`text-left rounded-xl border p-3.5 transition-colors ${
                  role === r ? "border-brand bg-red-50/50 ring-1 ring-brand" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  {r === "super_admin" && <ShieldCheck className="w-4 h-4 text-brand" />}
                  {ROLE_LABELS[r]}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">{ROLE_DESCRIPTIONS[r]}</span>
              </button>
            ))}
          </div>
        )}
        {roleNote && <p className="text-xs text-slate-500">{roleNote}</p>}
      </Section>

      <Section
        title="Access"
        description={isSuper ? undefined : `Manage ${counts.manage} · View ${counts.view} · No access ${meta.modules.length - counts.manage - counts.view}`}
      >
        {isSuper ? (
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-3 text-sm text-slate-600">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
            <span>Super Admins always have full access to every section and can manage dashboard accounts.</span>
          </div>
        ) : isMe ? (
          <p className="text-sm text-slate-500">You can&apos;t change your own access. Ask another Super Admin.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Set all:</span>
              {["manage", "view", "none"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAll(l)}
                  className="px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-600 hover:border-slate-400"
                >
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {meta.modules.map((m) => (
                <div key={m.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{m.label}</span>
                  <div className="inline-flex shrink-0 rounded-lg border border-slate-200 p-0.5 bg-slate-50" role="radiogroup" aria-label={m.label}>
                    {["none", "view", "manage"].map((l) => {
                      const active = levelOf(m.key) === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setPerms((p) => ({ ...p, [m.key]: l }))}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                            active
                              ? l === "manage"
                                ? "bg-brand text-white shadow-sm"
                                : l === "view"
                                ? "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
                                : "bg-slate-200 text-slate-600"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {LEVEL_LABELS[l]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              <strong className="font-semibold text-slate-500">View</strong> = can open the section and see its data.{" "}
              <strong className="font-semibold text-slate-500">Manage</strong> = can also add, edit, delete and export.
            </p>
          </>
        )}
      </Section>
    </DrawerShell>
  );
}
