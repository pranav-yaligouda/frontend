import React from "react";
import { Switch } from "@/components/ui/switch";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { toast } from "sonner";
import { setAgentOnlineStatus } from "@/api/agentApi";

const AgentStatusToggle: React.FC = () => {
  const { data: agent, isLoading, refetch } = useAgentProfile();
  const [loading, setLoading] = React.useState(false);
  const isOnline = agent?.isOnline;

  const handleToggle = async () => {
    if (!agent) return;
    setLoading(true);
    try {
      await setAgentOnlineStatus(!isOnline);
      toast.success(`You are now ${!isOnline ? "online" : "offline"}`);
      refetch();
    } catch (err) {
      const message = typeof err === 'string' ? err : 'Failed to update status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></span>
      <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
      <Switch checked={!!isOnline} onCheckedChange={handleToggle} disabled={loading || isLoading} aria-label="Toggle online/offline status" />
    </div>
  );
};

export default AgentStatusToggle; 