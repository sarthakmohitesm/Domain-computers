import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI, tasksAPI } from '@/integrations/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Search, UserCheck, ArrowRight, Laptop, Phone } from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  status: 'active' | 'disabled';
}

interface Task {
  id: string;
  task_id?: string;
  customer_name: string;
  contact_number?: string;
  device_name: string;
  problem_reported?: string;
  status: string;
  assigned_to: string | null;
}

interface AssignTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignTaskDialog = ({ task, open, onOpenChange }: AssignTaskDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: staffMembers, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      return await staffAPI.getAll() as StaffMember[];
    },
    enabled: open,
  });

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, staffId }: { taskId: string; staffId: string }) => {
      await tasksAPI.update(taskId, { assigned_to: staffId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Assigned',
        description: `Task has been assigned successfully.`,
      });
      setSelectedStaffId(null);
      setSearchQuery('');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAssign = () => {
    if (!task || !selectedStaffId) return;
    assignTaskMutation.mutate({
      taskId: task.id,
      staffId: selectedStaffId,
    });
  };

  const activeStaff = staffMembers?.filter((s) => s.status === 'active') || [];

  const filteredStaff = activeStaff.filter((staff) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (staff.full_name && staff.full_name.toLowerCase().includes(q)) ||
      staff.email.toLowerCase().includes(q)
    );
  });

  const getSelectedStaffName = () => {
    const staff = staffMembers?.find((s) => s.id === selectedStaffId);
    return staff?.full_name || staff?.email || '';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedStaffId(null);
        setSearchQuery('');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="glass sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            Select a staff member to assign this task to.
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            {/* Task Info Card */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">{task.task_id || 'N/A'}</span>
                <Badge variant="secondary" className="text-xs">
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              <h4 className="font-semibold text-base">{task.customer_name}</h4>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {task.device_name && (
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5" />
                    {task.device_name}
                  </span>
                )}
                {task.contact_number && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {task.contact_number}
                  </span>
                )}
              </div>
              {task.problem_reported && (
                <p className="text-sm text-muted-foreground line-clamp-2">{task.problem_reported}</p>
              )}
            </div>

            {/* Arrow Divider */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-px w-12 bg-border" />
                <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-wider">Assign to</span>
                <div className="h-px w-12 bg-border" />
              </div>
            </div>

            {/* Staff Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="assign-staff-search"
                placeholder="Search staff members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 pl-9"
              />
            </div>

            {/* Staff List */}
            <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1">
              {loadingStaff ? (
                <div className="text-center py-6 text-muted-foreground text-sm">Loading staff...</div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {searchQuery ? 'No staff match your search.' : 'No active staff members found.'}
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <button
                    key={staff.id}
                    id={`assign-staff-${staff.id}`}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedStaffId === staff.id
                        ? 'bg-primary/15 border-2 border-primary shadow-sm shadow-primary/10 scale-[1.01]'
                        : 'bg-background/50 border border-border/50 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                      selectedStaffId === staff.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {staff.full_name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{staff.email}</p>
                    </div>
                    {selectedStaffId === staff.id && (
                      <div className="flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-primary animate-in zoom-in-50 duration-200" />
                      </div>
                    )}
                    {task.assigned_to === staff.id && (
                      <Badge variant="outline" className="text-xs flex-shrink-0 border-primary/40 text-primary">
                        Current
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setSelectedStaffId(null);
                  setSearchQuery('');
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="glow"
                className="flex-1 gap-2"
                disabled={!selectedStaffId || assignTaskMutation.isPending || selectedStaffId === task.assigned_to}
                onClick={handleAssign}
                id="confirm-assign-btn"
              >
                {assignTaskMutation.isPending ? (
                  'Assigning...'
                ) : selectedStaffId ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Assign to {getSelectedStaffName()}
                  </>
                ) : (
                  'Select a staff member'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
