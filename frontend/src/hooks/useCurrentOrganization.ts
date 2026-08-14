import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as organizationsService from "../services/organizationsService";
import type { Organization } from "../types/organization";
import type { Paginated } from "../services/adminService";

export function useCurrentOrganization() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-organizations"],
    queryFn: organizationsService.fetchMyOrganizations,
  });

  const organization = data?.results[0] ?? null;

  const setOrganization = (updated: Organization) => {
    queryClient.setQueryData(["my-organizations"], (prev: Paginated<Organization> | undefined) =>
      prev ? { ...prev, results: [updated, ...prev.results.slice(1)] } : prev,
    );
  };

  return { organization, loading: isLoading, error: isError, reload: refetch, setOrganization };
}
