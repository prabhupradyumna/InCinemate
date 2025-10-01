"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/customer";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    full_name: string;
    email: string;
    phone: string;
  }>({ full_name: "", email: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await getCustomerProfile();
        setForm({
          full_name: p.full_name || "",
          email: p.email || "",
          phone: p.phone || "",
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateCustomerProfile({
        full_name: form.full_name,
        email: form.email,
      });
      setForm((f) => ({
        ...f,
        full_name: updated.full_name || "",
        email: updated.email || "",
      }));
      setSuccess("Profile updated");
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} disabled readOnly />
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
              {success ? (
                <p className="text-sm text-green-600">{success}</p>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
