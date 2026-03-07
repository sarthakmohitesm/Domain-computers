import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, profilesAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Phone, Laptop, User, Calendar, Search, FileText, Download, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  customer_name: string;
  contact_number: string;
  device_name: string;
  problem_reported: string;
  accessories_received?: string;
  assigned_to: string | null;
  status: string;
  completed_at: string | null;
  updated_at: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export const ApprovedTasks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await tasksAPI.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskToDelete(null);
      toast({
        title: 'Task Archived & Removed',
        description: 'The task has been saved to Google Sheet and removed from the system.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Remove',
        description: error.message || 'Could not archive the task to Google Sheet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'approved'],
    queryFn: async () => {
      return await tasksAPI.getByStatus('approved') as Task[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await profilesAPI.getAll() as Profile[];
    },
  });

  const getStaffName = (staffId: string | null) => {
    if (!staffId || !profiles) return 'Unknown';
    const profile = profiles.find((p) => p.id === staffId);
    return profile?.full_name || profile?.email || 'Unknown';
  };

  // Filter completed tasks
  const filteredTasks = tasks?.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.customer_name.toLowerCase().includes(q) ||
      task.device_name.toLowerCase().includes(q) ||
      task.problem_reported.toLowerCase().includes(q) ||
      task.contact_number.includes(q) ||
      getStaffName(task.assigned_to).toLowerCase().includes(q)
    );
  }) || [];

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTasks.length) return;
    const headers = ['Customer Name', 'Phone', 'Device Type', 'Problem', 'Assigned To', 'Status', 'Completion Date'];
    const rows = filteredTasks.map(task => [
      task.customer_name,
      task.contact_number,
      task.device_name,
      `"${task.problem_reported.replace(/"/g, '""')}"`,
      getStaffName(task.assigned_to),
      'Completed',
      task.completed_at ? new Date(task.completed_at).toLocaleDateString() : new Date(task.updated_at).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `completed_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Tasks
            {tasks && tasks.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {tasks.length} completed
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search completed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 shrink-0"
              onClick={exportToCSV}
              disabled={filteredTasks.length === 0}
            >
              <Download className="w-3 h-3" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No tasks match your search.' : 'No completed tasks yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Device Type</TableHead>
                  <TableHead>Problem Description</TableHead>
                  <TableHead>Assigned Employee</TableHead>
                  <TableHead>Task Status</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/admin/task/${task.id}`)}>
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
                      <span className="text-sm line-clamp-2 max-w-[200px]">{task.problem_reported}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {getStaffName(task.assigned_to)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {task.completed_at
                          ? new Date(task.completed_at).toLocaleDateString()
                          : new Date(task.updated_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/task/${task.id}`);
                          }}
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Remove Completed Task</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to remove this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {taskToDelete && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="font-medium">{taskToDelete.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{taskToDelete.device_name} — {taskToDelete.problem_reported}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setTaskToDelete(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(taskToDelete.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Removing...' : 'Remove Task'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
