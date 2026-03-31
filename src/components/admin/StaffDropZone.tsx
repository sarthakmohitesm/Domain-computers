import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI, tasksAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { UserPlus, GripVertical, Undo2, Phone, Laptop, Clock, Package, AlertCircle, MessageSquare, Hash } from 'lucide-react';
import { AssignTaskDialog } from './AssignTaskDialog';

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
  accessories_received?: string;
  status: string;
  staff_notes?: string | null;
  deadline?: string;
  created_at?: string;
  assigned_to: string | null;
  priority?: string;
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

const DraggableAssignedTask = ({ task, onReassign, onUnassign }: { task: Task; onReassign: () => void; onUnassign: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date() && !['completed', 'submitted', 'approved'].includes(task.status);

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={`p-2.5 rounded-lg bg-card/50 border border-border/30 text-sm transition-all group/task hover:border-primary/50 w-full ${
            isDragging ? 'shadow-lg shadow-primary/20 ring-2 ring-primary/30' : ''
          } ${isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}
        >
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div
              className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
              {...listeners}
              {...attributes}
              title="Drag to reassign"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0 py-0.5">
              <p className="font-medium text-sm truncate leading-tight" title={task.customer_name}>{task.customer_name}</p>
              <p className="text-muted-foreground text-[11px] truncate mt-0.5" title={task.device_name}>{task.device_name}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover/task:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={onReassign}
                    >
                      <UserPlus className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Reassign task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={onUnassign}
                    >
                      <Undo2 className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Unassign task</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Badge variant="outline" className="mt-1.5 text-xs">
            {task.status.replace('_', ' ')}
          </Badge>
          {task.priority && (
            <span className={`mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border block w-fit ${
              task.priority === 'high'
                ? 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                : task.priority === 'low'
                ? 'bg-green-500/20 text-green-500 border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
            }`}>
              {task.priority === 'high' ? '🟠 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
            </span>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-80 p-0 overflow-hidden">
        <div className="bg-primary/10 px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <p className="font-bold text-base">{task.customer_name}</p>
            {task.task_id && (
              <Badge variant="outline" className="font-mono text-[10px] gap-1">
                <Hash className="w-2.5 h-2.5" />{task.task_id}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge className={`text-[11px] ${statusColors[task.status] || ''}`}>
              {statusLabels[task.status] || task.status.replace('_', ' ')}
            </Badge>
            {task.priority && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                task.priority === 'high'
                  ? 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                  : task.priority === 'low'
                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
              }`}>
                {task.priority === 'high' ? '🟠 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5 text-sm">
          {task.contact_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{task.contact_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Device:</span>
            <span className="font-medium">{task.device_name}</span>
          </div>
          {task.problem_reported && (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">Problem:</span>
                <p className="font-medium mt-0.5">{task.problem_reported}</p>
              </div>
            </div>
          )}
          {task.accessories_received && (
            <div className="flex items-start gap-2">
              <Package className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">Accessories:</span>
                <p className="font-medium mt-0.5">{task.accessories_received}</p>
              </div>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                {new Date(task.deadline).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                {isOverdue && ' (Overdue!)'}
              </span>
            </div>
          )}
          {task.staff_notes && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-muted-foreground">Staff Notes:</span>
                <p className="font-medium mt-0.5">{task.staff_notes}</p>
              </div>
            </div>
          )}
          {task.created_at && (
            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              Created: {new Date(task.created_at).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const StaffCard = ({ staff, tasks, onReassign, onUnassign }: {
  staff: StaffMember;
  tasks: Task[];
  onReassign: (task: Task) => void;
  onUnassign: (task: Task) => void;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: staff.id,
    data: { staff },
  });

  const assignedTasks = tasks.filter((t) => true); // Already filtered by query

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border transition-all ${
        isOver
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
          : 'border-border/50 bg-background/50 hover:border-border'
      } ${staff.status === 'disabled' ? 'opacity-50' : ''}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-medium text-base truncate" title={staff.full_name || staff.email || 'Unnamed'}>{staff.full_name || staff.email || 'Unnamed'}</p>
        {assignedTasks.length > 0 && (
          <Badge variant="outline" className="text-xs">{assignedTasks.length} task{assignedTasks.length !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {isOver && (
        <div className="text-center py-4 border-2 border-dashed border-primary rounded-lg text-primary text-sm mb-3 animate-pulse">
          Drop task here to assign
        </div>
      )}

      {assignedTasks.length > 0 ? (
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
          {assignedTasks.map((task) => (
            <DraggableAssignedTask
              key={task.id}
              task={task}
              onReassign={() => onReassign(task)}
              onUnassign={() => onUnassign(task)}
            />
          ))}
        </div>
      ) : (
        !isOver && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No tasks assigned
          </p>
        )
      )}
    </div>
  );
};

export const StaffDropZone = () => {
  const [reassigningTask, setReassigningTask] = useState<Task | null>(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: staffMembers, isLoading: loadingStaff } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      return await staffAPI.getAll() as StaffMember[];
    },
  });

  const { data: allTasks } = useQuery({
    queryKey: ['tasks', 'assigned'],
    queryFn: async () => {
      return await tasksAPI.getAssigned() as (Task & { assigned_to: string })[];
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tasksAPI.update(taskId, { assigned_to: null, status: 'not_started' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Unassigned',
        description: 'Task has been moved back to the bucket.',
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

  const getTasksForStaff = (staffId: string) => {
    // Filter out approved tasks - they should not appear in staff cards
    return allTasks?.filter((t) => t.assigned_to === staffId && t.status !== 'approved') || [];
  };

  const handleReassign = (task: Task) => {
    setReassigningTask(task);
    setIsReassignDialogOpen(true);
  };

  const handleUnassign = (task: Task) => {
    unassignMutation.mutate(task.id);
  };

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-xl">Assign Tasks to Staff</CardTitle>
          <p className="text-sm text-muted-foreground">
            Drag tasks from the bucket and drop on a staff member, or click <UserPlus className="w-3 h-3 inline text-primary" /> to assign
          </p>
        </CardHeader>
        <CardContent>
          {loadingStaff ? (
            <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
          ) : !staffMembers || staffMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No staff members. Add staff members first.
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {staffMembers.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  tasks={getTasksForStaff(staff.id)}
                  onReassign={handleReassign}
                  onUnassign={handleUnassign}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignTaskDialog
        task={reassigningTask}
        open={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
      />
    </>
  );
};
