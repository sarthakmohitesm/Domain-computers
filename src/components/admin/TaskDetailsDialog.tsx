import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Phone, Laptop, Clock, MessageSquare, User, Calendar, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  task_id?: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  problem_reported: string;
  accessories_received?: string;
  status: string;
  staff_notes: string | null;
  assigned_to: string | null;
  deadline?: string;
  created_at: string;
  priority?: string;
}

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  working: 'bg-yellow-500/20 text-yellow-500',
  problem_found: 'bg-orange-500/20 text-orange-500',
  completed: 'bg-blue-500/20 text-blue-500',
  submitted: 'bg-purple-500/20 text-purple-500',
  approved: 'bg-green-500/20 text-green-500',
  rejected: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<string, string> = {
  not_started: 'Pending',
  working: 'In Progress',
  problem_found: 'Problem Found',
  completed: 'Completed',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const TaskDetailsDialog = ({ task, open, onOpenChange, staffName }: TaskDetailsDialogProps) => {
  const navigate = useNavigate();

  if (!task) return null;

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && !['completed', 'submitted', 'approved'].includes(task.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[600px] max-h-[85vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex items-center justify-between mt-2">
            <DialogTitle className="font-display text-xl flex flex-col gap-1">
              <span className="text-sm font-mono font-bold text-primary">{task.task_id || 'N/A'}</span>
              <span>{task.customer_name}</span>
            </DialogTitle>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusColors[task.status] || ''}>
                {statusLabels[task.status] || task.status.replace('_', ' ')}
              </Badge>
              {task.priority && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                  task.priority === 'low' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                  'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                }`}>
                  {task.priority === 'high' ? '🟠 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'} Priority
                </span>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs">
            Created on {format(new Date(task.created_at), 'PPP')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Customer & Device Info */}
          <div className="space-y-4">
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer Info</h4>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4 text-primary" />
                {task.contact_number}
              </div>
            </div>

            <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Device Info</h4>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Laptop className="w-4 h-4 text-primary" />
                {task.device_name}
              </div>
              {task.accessories_received && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                  <PlusCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">Accessories: {task.accessories_received}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignment & Deadlines */}
          <div className="space-y-4">
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2 border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assignment</h4>
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4 text-primary" />
                {staffName}
              </div>
            </div>

            <div className={`p-3 rounded-lg space-y-2 border ${isOverdue ? 'bg-destructive/10 border-destructive/20' : 'bg-secondary/50 border-border/50'}`}>
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>Deadline</h4>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className={`w-4 h-4 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
                {task.deadline ? (
                  <span className={isOverdue ? 'text-destructive' : ''}>
                    {format(new Date(task.deadline), 'PPP')}
                    {isOverdue && ' (Overdue)'}
                  </span>
                ) : (
                  <span className="text-muted-foreground">No deadline set</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Problem Reported
          </h4>
          <p className="text-sm p-3 bg-background/50 border border-border/50 rounded-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {task.problem_reported}
          </p>
        </div>

        {/* Staff Notes */}
        {task.staff_notes && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Staff Notes / Diagnosis
            </h4>
            <p className="text-sm p-3 bg-primary/5 border border-primary/10 rounded-lg leading-relaxed whitespace-pre-wrap">
              {task.staff_notes}
            </p>
          </div>
        )}

        {/* Action Bottom */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="glow" onClick={() => navigate(`/admin/task/${task.id}`)}>
            View Full Working Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
