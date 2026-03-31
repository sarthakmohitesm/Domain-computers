import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Flag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  task_id: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  accessories_received?: string;
  problem_reported: string;
  status: string;
  assigned_to?: string | null;
  deadline?: string;
  priority?: string;
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
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setCustomerName(task.customer_name);
      setContactNumber(task.contact_number);
      setDeviceName(task.device_name);
      setAccessoriesReceived(task.accessories_received || '');
      setProblemReported(task.problem_reported);
      setDeadline(task.deadline ? new Date(task.deadline) : undefined);
      setPriority((task.priority as 'high' | 'medium' | 'low') || 'medium');
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
        deadline: deadline ? deadline.toISOString() : undefined,
        priority,
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
          <div className="flex flex-col">
            <DialogTitle className="font-display">Edit Task</DialogTitle>
            <span className="text-[11px] font-mono font-bold text-primary mt-1">{task.task_id || 'N/A'}</span>
          </div>
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
            <Label htmlFor="edit-deadline">Task Deadline (Date) - Optional</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="edit-deadline"
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

