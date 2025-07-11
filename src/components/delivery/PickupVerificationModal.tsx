import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { OrderProcessingService } from '@/api/order';
import type { Order } from '@/types/order';

interface PickupVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: (order: Order) => void;
}

const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedOrder = await OrderProcessingService.verifyOrderPickup(order.id || order._id, pin);
      toast({
        title: 'Pickup Verified',
        description: 'Order has been successfully picked up!',
      });
      onSuccess(updatedOrder);
      onClose();
      setPin('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify pickup';
      setError(message);
      toast({
        title: 'Verification Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Pickup</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Enter Verification PIN</Label>
            <Input
              id="pin"
              type="text"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              pattern="[0-9]{4}"
              required
              disabled={isLoading}
              className="text-center text-lg tracking-widest"
            />
            <p className="text-sm text-gray-500">
              Enter the 4-digit PIN provided by the store/hotel
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || pin.length !== 4}
            >
              {isLoading ? 'Verifying...' : 'Verify Pickup'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PickupVerificationModal; 