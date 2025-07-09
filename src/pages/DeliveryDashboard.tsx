import * as React from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import DeliveryAgentVerificationModal from "@/components/delivery/DeliveryAgentVerificationModal";
import type { Order } from "@/types/order";
import { submitVerification, fetchAgentProfile } from "@/api/agentApi";
import { useEffect } from "react";
import { useAgentProfile, AGENT_PROFILE_QUERY_KEY } from '@/hooks/useAgentProfile';
import { useQueryClient } from '@tanstack/react-query';

const DeliveryDashboard = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useAgentProfile();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleVerificationSubmit = async (data: { driverLicenseNumber: string; vehicleRegistrationNumber: string }) => {
    setLoading(true);
    try {
      await submitVerification(data);
      await queryClient.invalidateQueries({ queryKey: AGENT_PROFILE_QUERY_KEY });
      toast.success("Verification details submitted. Awaiting approval.");
    } catch (error) {
      toast.error("Failed to submit verification details.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !user) return <div>Error loading profile.</div>;

  if (user.verificationStatus === "verified") {
    return (
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{orders.filter(o => o.status === 'DELIVERED').length}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold"> ₹{orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.total || 0), 0)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{orders.filter(o => o.status !== 'DELIVERED').length}</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  if (user.verificationStatus === "pending") {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Pending Verification</h2>
        <p className="text-gray-600 mb-6">Your details have been submitted and are pending admin approval. You will be notified once verified.</p>
      </div>
    );
  }
  if (user.verificationStatus === "rejected") {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Verification Rejected</h2>
        <p className="text-gray-600 mb-6">Your verification was rejected. Please resubmit your details.</p>
        <DeliveryAgentVerificationModal onSubmit={handleVerificationSubmit} loading={loading} />
      </div>
    );
  }
  // Default: show verification modal if not verified, pending, or rejected
  return <DeliveryAgentVerificationModal onSubmit={handleVerificationSubmit} loading={loading} />;
};

export default DeliveryDashboard; 