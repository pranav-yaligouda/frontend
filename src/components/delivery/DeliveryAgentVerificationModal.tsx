import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (data: { driverLicenseNumber: string; vehicleRegistrationNumber: string }) => void;
  loading?: boolean;
}

const DeliveryAgentVerificationModal: React.FC<Props> = ({ onSubmit, loading }) => {
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!driverLicenseNumber.trim() || !vehicleRegistrationNumber.trim()) {
      setError("All fields are required.");
      return;
    }
    await onSubmit({ driverLicenseNumber, vehicleRegistrationNumber });
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Delivery Agent Verification</DialogTitle>
          <DialogDescription>
            Please provide your driver license number and vehicle registration number to get verified as a delivery agent. You cannot access the dashboard until verified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700 mb-1">Driver License Number</label>
            <Input
              id="driverLicenseNumber"
              value={driverLicenseNumber}
              onChange={e => setDriverLicenseNumber(e.target.value)}
              required
              autoFocus
              autoComplete="off"
              placeholder="Enter your driver license number"
            />
          </div>
          <div>
            <label htmlFor="vehicleRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration Number</label>
            <Input
              id="vehicleRegistrationNumber"
              value={vehicleRegistrationNumber}
              onChange={e => setVehicleRegistrationNumber(e.target.value)}
              required
              autoComplete="off"
              placeholder="Enter your vehicle registration number"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryAgentVerificationModal; 