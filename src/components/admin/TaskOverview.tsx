import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tasksAPI, profilesAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Phone, Laptop, MessageSquare, FileText, Search, Edit, Clock } from 'lucide-react';
import { EditTaskDialog } from './EditTaskDialog';
import { TaskDetailsDialog } from './TaskDetailsDialog';

interface Task {
  id: string;
  task_id: string;
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
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
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

export const TaskOverview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      return await tasksAPI.getAssigned() as Task[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await profilesAPI.getAll() as Profile[];
    },
  });

  const getStaffName = (staffId: string | null) => {
    if (!staffId || !profiles) return 'Unassigned';
    const profile = profiles.find((p) => p.id === staffId);
    return profile?.full_name || profile?.email || 'Unknown';
  };

  // Statuses that represent completed/finished work — hide these from overview
  const completedStatuses = ['completed', 'approved'];

  // Filter out completed tasks, then apply search
  const filteredTasks = tasks?.filter((task) => {
    // Exclude completed/approved tasks
    if (completedStatuses.includes(task.status)) return false;

    // Apply search filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (task.task_id && task.task_id.toLowerCase().includes(q)) ||
      task.customer_name.toLowerCase().includes(q) ||
      task.device_name.toLowerCase().includes(q) ||
      task.problem_reported.toLowerCase().includes(q) ||
      task.contact_number.includes(q) ||
      getStaffName(task.assigned_to).toLowerCase().includes(q)
    );
  }) || [];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleView = (task: Task) => {
    setViewingTask(task);
    setIsViewDialogOpen(true);
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="font-display text-xl">Task Overview</CardTitle>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/50 pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingTasks ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No tasks match your search.' : 'No active tasks at the moment.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
                  const isOverdue = deadlineDate && deadlineDate < new Date() && !['completed', 'submitted', 'approved'].includes(task.status);

                  return (
                  <TableRow 
                    key={task.id} 
                    className={`cursor-pointer transition-all hover:bg-muted/30 ${isOverdue ? 'bg-destructive/10 hover:bg-destructive/20' : ''}`} 
                    onClick={() => handleView(task)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {task.task_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.customer_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {task.contact_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-muted-foreground" />
                        {task.device_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {getStaffName(task.assigned_to)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status] || ''}>
                        {statusLabels[task.status] || task.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md w-fit ${
                          isOverdue ? 'bg-destructive text-destructive-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.staff_notes ? (
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MessageSquare className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {task.staff_notes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(task);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(task);
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        )}

        <EditTaskDialog
          task={editingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />

        <TaskDetailsDialog
          task={viewingTask}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          staffName={getStaffName(viewingTask?.assigned_to || null)}
        />
      </CardContent>
    </Card>
  );
};

