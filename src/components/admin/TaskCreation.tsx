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
import { Plus, Package, CalendarIcon, Flag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const TaskCreation = () => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [problemReported, setProblemReported] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
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
        deadline: deadline ? deadline.toISOString() : undefined,
        priority,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setCustomerName('');
      setContactNumber('');
      setDeviceName('');
      setAccessoriesReceived('');
      setProblemReported('');
      setDeadline(undefined);
      setPriority('medium');
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
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" />
              Priority
            </Label>
            <div className="flex gap-2">
              {([
                { value: 'high', label: '🟠 High', active: 'bg-orange-500/20 text-orange-500 border-orange-500/50' },
                { value: 'medium', label: '🟡 Medium', active: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' },
                { value: 'low', label: '🟢 Low', active: 'bg-green-500/20 text-green-500 border-green-500/50' },
              ] as const).map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-1.5 px-2 text-sm rounded-md border transition-all font-medium ${
                    priority === p.value
                      ? p.active
                      : 'bg-background/50 border-border/50 text-muted-foreground hover:border-border'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="deadline">Task Deadline (Date) - Optional</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="deadline"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background/50",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a deadline date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
