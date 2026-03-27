import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI, tasksAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { UserPlus, GripVertical, Undo2 } from 'lucide-react';
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
  status: string;
  assigned_to: string | null;
}

const DraggableAssignedTask = ({ task, onReassign, onUnassign }: { task: Task; onReassign: () => void; onUnassign: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2.5 rounded-lg bg-card/50 border border-border/30 text-sm transition-all group/task hover:border-primary/50 ${
        isDragging ? 'shadow-lg shadow-primary/20 ring-2 ring-primary/30' : ''
      }`}
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

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{task.customer_name}</p>
          <p className="text-muted-foreground text-xs truncate">{task.device_name}</p>
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
    </div>
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
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium text-base">{staff.full_name || staff.email || 'Unnamed'}</p>
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
        <div className="space-y-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
