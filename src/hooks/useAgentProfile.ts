import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAgentProfile } from '@/api/agentApi';

export const AGENT_PROFILE_QUERY_KEY = ['agentProfile'];

export function useAgentProfile() {
  return useQuery({
    queryKey: AGENT_PROFILE_QUERY_KEY,
    queryFn: fetchAgentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
} 