"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Shield, UserCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Modal } from "@/components/admin/Modal";
import { FormField } from "@/components/admin/FormField";
import { adminDelete, adminPost, adminPatch } from "@/hooks/useAdminFetch";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const roleOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "Editor", value: "EDITOR" },
  { label: "Viewer", value: "VIEWER" },
];

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3.5 w-3.5" />,
  EDITOR: <UserCheck className="h-3.5 w-3.5" />,
  VIEWER: <Eye className="h-3.5 w-3.5" />,
};

const roleBadgeVariants: Record<string, "error" | "secondary" | "default"> = {
  ADMIN: "error",
  EDITOR: "secondary",
  VIEWER: "default",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("EDITOR");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setUsers(json.data ?? []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("EDITOR");
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editUser) {
        const data: Record<string, string> = { name: formName, email: formEmail, role: formRole };
        if (formPassword) data.password = formPassword;
        await adminPatch(`/api/users/${editUser.id}`, data);
      } else {
        await adminPost("/api/users", {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <span className="font-medium text-text-primary">{row.name}</span>
          <p className="text-xs text-text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Badge variant={roleBadgeVariants[row.role] ?? "default"}>
          <span className="flex items-center gap-1">
            {roleIcons[row.role]}
            {row.role}
          </span>
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => <span className="text-text-secondary">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (row) => <span className="text-text-secondary">{formatDate(row.updatedAt)}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}>
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage admin panel access and roles.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          rowKey={(row) => row.id}
          emptyMessage="No users found."
        />
      )}

      {/* Create/Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? "Edit User" : "Create User"}
      >
        <div className="space-y-4">
          {error && (
            <p className="rounded-lg bg-status-error/10 px-3 py-2 text-sm text-status-error">
              {error}
            </p>
          )}
          <FormField label="Name" required>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Full name"
            />
          </FormField>
          <FormField label="Email" required>
            <Input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </FormField>
          <FormField
            label={editUser ? "New Password (leave blank to keep)" : "Password"}
            required={!editUser}
          >
            <Input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder={editUser ? "••••••••" : "Min 8 characters"}
            />
          </FormField>
          <FormField label="Role" required>
            <Select
              options={roleOptions}
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
            />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await adminDelete(`/api/users/${deleteId}`);
            fetchUsers();
          }
        }}
        title="Delete User?"
        description="This will permanently remove this user's access to the admin panel."
      />
    </div>
  );
}
