"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account and platform settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Name</label>
              <Input defaultValue={session?.user?.name ?? ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
              <Input defaultValue={session?.user?.email ?? ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Role</label>
              <div className="mt-1">
                <Badge variant="accent">{session?.user?.role ?? "—"}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">
                Change Password
              </label>
              <Input type="password" placeholder="New password" />
            </div>
            <div>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={saving}
              onClick={() => {
                setSaving(true);
                setTimeout(() => setSaving(false), 1000);
              }}
            >
              {saving ? "Saving..." : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
          </div>
          <p className="text-sm text-text-secondary">
            Notification preferences will be available in a future update.
          </p>
        </div>

        {/* Platform */}
        <div className="rounded-xl border border-gray-200 bg-surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Platform</h2>
          </div>
          <p className="text-sm text-text-secondary">
            Platform configuration options will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
