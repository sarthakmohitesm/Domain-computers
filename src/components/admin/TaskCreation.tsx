import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Package } from 'lucide-react';

export const TaskCreation = () => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [problemReported, setProblemReported] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      await tasksAPI.create({
        customer_name: customerName,
        contact_number: contactNumber,
        device_name: deviceName,
        accessories_received: accessoriesReceived,
        problem_reported: problemReported,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setCustomerName('');
      setContactNumber('');
      setDeviceName('');
      setAccessoriesReceived('');
      setProblemReported('');
      toast({
        title: 'Task Created',
        description: 'New repair task has been added to the bucket.',
      });
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
    createTaskMutation.mutate();
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-display text-xl">Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="Enter customer name"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-number">Phone Number</Label>
              <Input
                id="contact-number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
                placeholder="Enter phone number"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Device Type</Label>
              <Input
                id="device-name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                placeholder="e.g., Laptop, Desktop, Phone"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessories-received" className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Accessories Received
              </Label>
              <Input
                id="accessories-received"
                value={accessoriesReceived}
                onChange={(e) => setAccessoriesReceived(e.target.value)}
                placeholder="e.g., Charger, Mouse, Bag"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="problem-reported">Problem Reported</Label>
            <Textarea
              id="problem-reported"
              value={problemReported}
              onChange={(e) => setProblemReported(e.target.value)}
              required
              placeholder="Describe the issue in detail..."
              className="bg-background/50 min-h-[100px]"
            />
          </div>
          <Button
            type="submit"
            variant="glow"
            className="w-full gap-2"
            disabled={createTaskMutation.isPending}
          >
            <Plus className="w-4 h-4" />
            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
