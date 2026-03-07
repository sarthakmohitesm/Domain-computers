import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  accessories_received?: string;
  problem_reported: string;
  status: string;
  assigned_to?: string | null;
}

interface EditTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditTaskDialog = ({ task, open, onOpenChange }: EditTaskDialogProps) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [problemReported, setProblemReported] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setCustomerName(task.customer_name);
      setContactNumber(task.contact_number);
      setDeviceName(task.device_name);
      setAccessoriesReceived(task.accessories_received || '');
      setProblemReported(task.problem_reported);
    }
  }, [task]);

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (!task) return;
      await tasksAPI.update(task.id, {
        customer_name: customerName,
        contact_number: contactNumber,
        device_name: deviceName,
        accessories_received: accessoriesReceived,
        problem_reported: problemReported,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Updated',
        description: 'Task has been updated successfully.',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate();
  };

  if (!task) return null;

  // Don't allow editing approved tasks
  if (task.status === 'approved') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Cannot Edit Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This task has been approved and cannot be edited. Approved tasks are final records.
          </p>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customer-name">Customer Name</Label>
              <Input
                id="edit-customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="Enter customer name"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact-number">Contact Number</Label>
              <Input
                id="edit-contact-number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                placeholder="Enter contact number"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-device-name">Device Type</Label>
              <Input
                id="edit-device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                placeholder="e.g., Laptop, Desktop, Phone"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-accessories">Accessories Received</Label>
              <Input
                id="edit-accessories"
                value={accessoriesReceived}
                onChange={(e) => setAccessoriesReceived(e.target.value)}
                placeholder="e.g., Charger, Mouse, Bag"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-problem-reported">Problem Reported</Label>
            <Textarea
              id="edit-problem-reported"
              value={problemReported}
              onChange={(e) => setProblemReported(e.target.value)}
              required
              placeholder="Describe the issue..."
              className="bg-background/50 min-h-[100px]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

