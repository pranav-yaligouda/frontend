import { useAuth, UserRole } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireHotelManager({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // or a loader
  if (!user || user.role !== UserRole.HOTEL_MANAGER) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
} 