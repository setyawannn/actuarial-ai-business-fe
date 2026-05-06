import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { MeResponseData, ApiEnvelope } from "@/types/api";

async function fetchMe(): Promise<MeResponseData> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  const data = await res.json() as ApiEnvelope<MeResponseData>;
  if (!data.success) {
    throw new Error(data.error?.message || "Not authenticated");
  }
  return data.data;
}

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Login failed");
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.clear(); // clears all cache including me
    },
  });
}
