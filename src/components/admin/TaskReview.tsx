import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, profilesAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Phone, Laptop, User, MessageSquare } from 'lucide-react';

interface Task {
  id: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  problem_reported: string;
  status: string;
  staff_notes: string | null;
  assigned_to: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export const TaskReview = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'submitted'],
    queryFn: async () => {
      return await tasksAPI.getByStatus('submitted') as Task[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await profilesAPI.getAll() as Profile[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tasksAPI.update(taskId, { status: 'approved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Approved',
        description: 'The task has been approved and moved to completed tasks.',
      });
    },
  });


  const rejectMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
      await tasksAPI.update(taskId, { status: 'rejected', rejection_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTask(null);
      setRejectionReason('');
      toast({
        title: 'Task Rejected',
        description: 'The task has been returned to the staff member with feedback.',
      });
    },
  });

  const getStaffName = (staffId: string | null) => {
    if (!staffId || !profiles) return 'Unknown';
    const profile = profiles.find((p) => p.id === staffId);
    return profile?.full_name || profile?.email || 'Unknown';
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center justify-between">
          Tasks Pending Review
          {tasks && tasks.length > 0 && (
            <Badge variant="outline">{tasks.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks pending review.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{task.customer_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {task.contact_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Laptop className="w-3 h-3" />
                        {task.device_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getStaffName(task.assigned_to)}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-500">Submitted</Badge>
                </div>

                <p className="text-sm mb-2">
                  <strong>Problem:</strong> {task.problem_reported}
                </p>

                {task.staff_notes && (
                  <div className="flex items-start gap-2 p-2 rounded bg-card/50 mb-3">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Staff Notes:</p>
                      <p className="text-sm">{task.staff_notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="glow"
                    size="sm"
                    className="gap-1"
                    onClick={() => approveMutation.mutate(task.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => setSelectedTask(task)}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 ml-auto"
                    onClick={() => navigate(`/admin/task/${task.id}`)}
                  >
                    View Details
                  </Button>

                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Reject Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting this task. The staff member will see
                this feedback.
              </p>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-background/50 min-h-[100px]"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setSelectedTask(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedTask && rejectionReason.trim()) {
                      rejectMutation.mutate({
                        taskId: selectedTask.id,
                        reason: rejectionReason,
                      });
                    }
                  }}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
