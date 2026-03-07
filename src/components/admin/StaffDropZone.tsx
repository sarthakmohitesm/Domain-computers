import { useQuery } from '@tanstack/react-query';
import { staffAPI, tasksAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  status: 'active' | 'disabled';
}

interface Task {
  id: string;
  customer_name: string;
  device_name: string;
  status: string;
}

const DraggableAssignedTask = ({ task }: { task: Task }) => {
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
      {...listeners}
      {...attributes}
      className="p-2 rounded bg-card/50 border border-border/30 text-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
    >
      <p className="font-medium">{task.customer_name}</p>
      <p className="text-muted-foreground text-xs">{task.device_name}</p>
      <Badge variant="outline" className="mt-1 text-xs">
        {task.status.replace('_', ' ')}
      </Badge>
    </div>
  );
};

const StaffCard = ({ staff, tasks }: { staff: StaffMember; tasks: Task[] }) => {
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
          ? 'border-primary bg-primary/10'
          : 'border-border/50 bg-background/50 hover:border-border'
      } ${staff.status === 'disabled' ? 'opacity-50' : ''}`}
    >
      <div className="mb-3">
        <p className="font-medium text-base">{staff.full_name || staff.email || 'Unnamed'}</p>
      </div>

      {isOver && (
        <div className="text-center py-4 border-2 border-dashed border-primary rounded-lg text-primary text-sm mb-3">
          Drop task here to assign
        </div>
      )}

      {assignedTasks.length > 0 ? (
        <div className="space-y-2">
          {assignedTasks.map((task) => (
            <DraggableAssignedTask key={task.id} task={task} />
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

  const getTasksForStaff = (staffId: string) => {
    // Filter out approved tasks - they should not appear in staff cards
    return allTasks?.filter((t) => t.assigned_to === staffId && t.status !== 'approved') || [];
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-display text-xl">Assign Tasks to Staff</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag tasks from the bucket and drop on a staff member to assign
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
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
