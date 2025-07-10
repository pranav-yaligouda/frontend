import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAgentOnlineStatus } from '@/api/agentApi';
import { toast } from '@/hooks/use-toast';

export function useAgentStatusToggle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (online: boolean) => setAgentOnlineStatus(online),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentProfile'] });
    },
    onError: (error: unknown) => {
      let message = 'Failed to update agent status';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Agent Status Error', description: message, });
      console.error('Agent status toggle error:', message);
    },
  });
} 