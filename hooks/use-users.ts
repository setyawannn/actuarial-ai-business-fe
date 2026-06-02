import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ApiClientError,
  ApiEnvelope,
  AdminUsersTableData,
  AdminUserListItem,
  MeResponseData,
} from "@/types/api";

function getEnvelopeErrorMessage<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) return fallback;
  return data.message || data.error?.message || data.errors?.[0]?.message || fallback;
}

function getEnvelopeErrorCode<T>(data: ApiEnvelope<T>, fallback: string) {
  if (data.success) return fallback;
  return data.code || data.error?.code || fallback;
}

async function parseEnvelope<T>(res: Response, fallback: string): Promise<T> {
  const data = (await res.json()) as ApiEnvelope<T>;

  if (!data.success) {
    throw new ApiClientError(
      getEnvelopeErrorMessage(data, fallback),
      getEnvelopeErrorCode(data, "UNKNOWN"),
      data.meta
    );
  }

  return data.data;
}

export interface AdminUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  [key: string]: unknown;
}

export function useAdminUsersQuery(params?: AdminUsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params as Record<string, unknown>),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", params.page.toString());
      if (params?.page_size) query.set("page_size", params.page_size.toString());
      if (params?.search) query.set("search", params.search);
      
      const qs = query.toString();
      const queryString = qs ? `?${qs}` : "";
      
      const res = await fetch(`/api/admin/users${queryString}`);
      return parseEnvelope<AdminUsersTableData>(res, "Failed to fetch users");
    },
    retry: false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password?: string;
      full_name?: string | null;
      role: string;
      is_active: boolean;
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<AdminUserListItem>(res, "Failed to create user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: number;
      payload: {
        role?: string;
        is_active?: boolean;
      };
    }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<AdminUserListItem>(res, "Failed to update user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { full_name: string }) => {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<MeResponseData>(res, "Failed to update profile");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return parseEnvelope<{ id: number }>(res, "Failed to change password");
    },
  });
}
