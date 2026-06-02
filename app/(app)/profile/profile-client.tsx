"use client";

import * as React from "react";
import { BadgeCheckIcon, KeyRoundIcon, UserIcon } from "lucide-react";
import { useMeQuery } from "@/hooks/use-auth";
import { useChangePasswordMutation, useUpdateProfileMutation } from "@/hooks/use-users";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";

export function ProfileClient() {
  const { data: meData, isLoading } = useMeQuery();
  const updateProfile = useUpdateProfileMutation();
  const changePassword = useChangePasswordMutation();

  const [fullName, setFullName] = React.useState("");
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    if (meData?.name || meData?.full_name) {
      setFullName(meData.full_name || meData.name || "");
    }
  }, [meData]);

  async function submitUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim()) return;

    try {
      await updateProfile.mutateAsync({ full_name: fullName.trim() });
      showAdminSuccess("Profile updated", "Data profil berhasil diperbarui.");
    } catch (error) {
      showAdminError("Failed to update profile", error);
    }
  }

  async function submitChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      showAdminError("Validasi gagal", new Error("Konfirmasi password baru tidak cocok."));
      return;
    }

    if (newPassword.length < 8) {
      showAdminError("Validasi gagal", new Error("Password baru minimal 8 karakter."));
      return;
    }

    try {
      await changePassword.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });

      showAdminSuccess("Password changed", "Kata sandi Anda berhasil diubah.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      showAdminError("Failed to change password", error);
    }
  }

  return (
    <div className="w-full space-y-8">
      <PageHeader
        title="Profile Settings"
        description="Kelola informasi pribadi dan keamanan akun Anda."
      />

      <div className="grid w-full gap-8 lg:grid-cols-2">
        <Card className="flex flex-col w-full border-border/70 shadow-sm h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5 text-muted-foreground" />
              Informasi Akun
            </CardTitle>
            <CardDescription>
              Ubah nama lengkap yang akan ditampilkan di dalam sistem.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={submitUpdateProfile} className="flex-1 flex flex-col space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input value={meData?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah.</p>
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <div className="mt-1">
                    {isLoading ? (
                      <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {meData?.role || "Unknown"}
                      </Badge>
                    )}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Nama Lengkap</FieldLabel>
                  <Input
                    required
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end mt-auto pt-4">
                <Button type="submit" disabled={updateProfile.isPending || isLoading}>
                  Simpan Profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="flex flex-col w-full border-border/70 shadow-sm h-full">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-5 text-muted-foreground" />
              Ganti Password
            </CardTitle>
            <CardDescription>
              Ubah password Anda untuk menjaga keamanan akun.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={submitChangePassword} className="flex-1 flex flex-col space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel>Password Lama</FieldLabel>
                  <PasswordInput
                    required
                    placeholder="Masukkan password lama"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Password Baru</FieldLabel>
                  <PasswordInput
                    required
                    placeholder="Masukkan password baru (minimal 8 karakter)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Konfirmasi Password Baru</FieldLabel>
                  <PasswordInput
                    required
                    placeholder="Ketik ulang password baru"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end mt-auto pt-4">
                <Button type="submit" disabled={changePassword.isPending}>
                  Ganti Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
