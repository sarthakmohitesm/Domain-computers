import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Phone, Laptop, Clock, Edit, UserPlus, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EditTaskDialog } from './EditTaskDialog';
import { AssignTaskDialog } from './AssignTaskDialog';

interface Task {
  id: string;
  task_id: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  problem_reported: string;
  status: string;
  created_at: string;
  assigned_to: string | null;
}

const DraggableTask = ({ task, onDelete, onEdit, onAssign }: { task: Task; onDelete: () => void; onEdit: () => void; onAssign: () => void }) => {
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
      className={`p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all group ${
        isDragging ? 'shadow-lg shadow-primary/20 ring-2 ring-primary/30' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing mt-1 p-0.5 rounded hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
            {...listeners}
            {...attributes}
            title="Drag to assign"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold text-primary mb-0.5 block">{task.task_id || 'N/A'}</span>
            <h4 className="font-medium truncate">
              {task.customer_name}
            </h4>
          </div>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onAssign}
                  id={`assign-btn-${task.id}`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to assign</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onEdit}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="pl-6">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            {task.contact_number}
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="w-3 h-3" />
            {task.device_name}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {new Date(task.created_at).toLocaleDateString()}
          </div>
        </div>
        <p className="text-sm mt-2 line-clamp-2">{task.problem_reported}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">
            Unassigned
          </Badge>
          <span className="text-[10px] text-muted-foreground hidden group-hover:inline-flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
            <GripVertical className="w-3 h-3" /> Drag or click <UserPlus className="w-3 h-3" /> to assign
          </span>
        </div>
      </div>
    </div>
  );
};

export const TaskBucket = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'unassigned'],
    queryFn: async () => {
      return await tasksAPI.getUnassigned() as Task[];
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tasksAPI.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'The task has been removed.',
      });
    },
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleAssign = (task: Task) => {
    setAssigningTask(task);
    setIsAssignDialogOpen(true);
  };

  return (
    <Card className="glass border-border/50 h-full">
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            Task Bucket
            {tasks && tasks.length > 0 && (
              <Badge variant="outline">{tasks.length}</Badge>
            )}
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Drag tasks to staff cards or click <UserPlus className="w-3 h-3 inline" /> to assign
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No unassigned tasks. Create a new task to get started.
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {tasks.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
                onEdit={() => handleEdit(task)}
                onAssign={() => handleAssign(task)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <AssignTaskDialog
        task={assigningTask}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
      />
    </Card>
  );
};
