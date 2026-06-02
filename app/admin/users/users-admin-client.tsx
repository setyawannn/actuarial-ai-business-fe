"use client";

import * as React from "react";
import { format } from "date-fns";
import { CheckIcon, CircleHelpIcon, SearchIcon, ShieldCheckIcon, UserPlusIcon, XIcon, PencilLineIcon } from "lucide-react";
import {
  useAdminUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/hooks/use-users";
import { AdminUserListItem } from "@/types/api";
import { showAdminError, showAdminSuccess } from "@/lib/admin-feedback";
import { PageHeader } from "@/components/page-header";
import { ErrorCard } from "@/components/error-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export function UsersAdminClient() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const usersQuery = useAdminUsersQuery({
    page,
    page_size: 20,
    search: debouncedSearch || undefined,
  });

  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();

  const data = usersQuery.data;
  const users = data?.items ?? [];

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserListItem | null>(null);

  const [createForm, setCreateForm] = React.useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    is_active: true,
  });

  const [editForm, setEditForm] = React.useState({
    role: "user",
    is_active: true,
  });

  function resetCreateForm() {
    setCreateForm({
      email: "",
      password: "",
      full_name: "",
      role: "user",
      is_active: true,
    });
  }

  function openEdit(user: AdminUserListItem) {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      is_active: user.is_active,
    });
    setIsEditOpen(true);
  }

  async function submitCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createUser.mutateAsync({
        email: createForm.email.trim(),
        password: createForm.password.trim(),
        full_name: createForm.full_name.trim() || null,
        role: createForm.role,
        is_active: createForm.is_active,
      });

      showAdminSuccess("User created", "Pengguna baru berhasil ditambahkan.");
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (error) {
      showAdminError("Failed to create user", error);
    }
  }

  async function submitEditUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingUser) return;

    try {
      await updateUser.mutateAsync({
        userId: editingUser.id,
        payload: {
          role: editForm.role,
          is_active: editForm.is_active,
        },
      });

      showAdminSuccess("User updated", "Data pengguna berhasil diperbarui.");
      setIsEditOpen(false);
      setEditingUser(null);
    } catch (error) {
      showAdminError("Failed to update user", error);
    }
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="User & Role Management"
        description="Kelola daftar pengguna, tambah pengguna baru, dan atur peran (role) secara aman."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <UserPlusIcon className="size-4" />
            Add User
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {data ? (
            <>
              <Badge variant="outline">Total Users: {data.total}</Badge>
              <Badge variant="outline">Page {data.page} of {data.total_pages}</Badge>
            </>
          ) : null}
        </div>
      </PageHeader>

      {usersQuery.error ? (
        <ErrorCard title="Gagal memuat pengguna" error={usersQuery.error} />
      ) : null}

      <Card className="w-full border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="space-y-1">
            <CardTitle>Directory</CardTitle>
            <CardDescription>Semua pengguna yang terdaftar di sistem.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari email atau nama..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="w-full">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{user.full_name || "Tanpa Nama"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" || user.role === "super_admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "outline" : "destructive"} className="gap-1.5">
                          {user.is_active ? (
                            <>
                              <CheckIcon className="size-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XIcon className="size-3" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                          <PencilLineIcon className="size-4" />
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-12 text-center">
              <ShieldCheckIcon className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground">Tidak ada pengguna ditemukan</p>
              <p className="text-sm text-muted-foreground mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          )}

          {data && data.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {data.total_pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Buat pengguna baru dengan mengatur kredensial dan hak akses awal.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitCreateUser}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </Field>
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                  />
                </Field>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    placeholder="Nama Lengkap"
                  />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={createForm.role}
                    onValueChange={(val) => setCreateForm({ ...createForm, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Status Active</FieldLabel>
                  <Select
                    value={createForm.is_active ? "true" : "false"}
                    onValueChange={(val) => setCreateForm({ ...createForm, is_active: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUser.isPending || !createForm.email || !createForm.password}>
                Create User
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Edit User Role & Status</SheetTitle>
            <SheetDescription>
              Ubah peran atau nonaktifkan pengguna {editingUser?.email}.
            </SheetDescription>
          </SheetHeader>
          <form className="flex h-full flex-col" onSubmit={submitEditUser}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>User Email</FieldLabel>
                  <Input value={editingUser?.email || ""} disabled />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={editForm.role}
                    onValueChange={(val) => setEditForm({ ...editForm, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Status Active</FieldLabel>
                  <Select
                    value={editForm.is_active ? "true" : "false"}
                    onValueChange={(val) => setEditForm({ ...editForm, is_active: val === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>
            <SheetFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
