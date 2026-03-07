import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Cpu, LogOut, Phone, Laptop, AlertCircle, Send, FileText,
  Settings, Clock, CheckCircle, Package, Wrench
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const statusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  working: 'bg-yellow-500/20 text-yellow-500',
  problem_found: 'bg-orange-500/20 text-orange-500',
  completed: 'bg-blue-500/20 text-blue-500',
  submitted: 'bg-purple-500/20 text-purple-500',
  rejected: 'bg-destructive/20 text-destructive',
  approved: 'bg-green-500/20 text-green-500',
};

const statusLabels: Record<string, string> = {
  not_started: 'Pending',
  working: 'In Progress',
  problem_found: 'Problem Found',
  completed: 'Completed',
  submitted: 'Submitted',
  rejected: 'Rejected',
  approved: 'Approved',
};

const StaffDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      return await tasksAPI.getMyTasks();
    },
    enabled: !!user,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await tasksAPI.update(taskId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({ title: 'Task Updated' });
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Filter tasks
  const filteredTasks = tasks?.filter((task: any) => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  }) || [];

  // Task stats
  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter((t: any) => t.status === 'not_started').length || 0,
    working: tasks?.filter((t: any) => ['working', 'problem_found'].includes(t.status)).length || 0,
    rejected: tasks?.filter((t: any) => t.status === 'rejected').length || 0,
    completed: tasks?.filter((t: any) => ['completed', 'submitted'].includes(t.status)).length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-lg">Employee Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total', value: taskStats.total, icon: Wrench, color: 'text-primary' },
            { label: 'Pending', value: taskStats.pending, icon: Clock, color: 'text-muted-foreground' },
            { label: 'In Progress', value: taskStats.working, icon: Wrench, color: 'text-yellow-500' },
            { label: 'Rejected', value: taskStats.rejected, icon: AlertCircle, color: 'text-destructive' },
            { label: 'Done', value: taskStats.completed, icon: CheckCircle, color: 'text-green-500' },
          ].map((stat) => (
            <Card key={stat.label} className="glass border-border/50">
              <CardContent className="py-4 px-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter + Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">My Tasks</h2>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="not_started">Pending</SelectItem>
              <SelectItem value="working">In Progress</SelectItem>
              <SelectItem value="problem_found">Problem Found</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredTasks.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-8 text-center text-muted-foreground">
              {statusFilter === 'all'
                ? 'No tasks assigned to you.'
                : `No tasks with status "${statusLabels[statusFilter] || statusFilter}".`}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task: any) => (
              <Card key={task.id} className="glass border-border/50 hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.customer_name}</CardTitle>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />{task.contact_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Laptop className="w-3 h-3" />{task.device_name}
                        </span>
                      </div>
                    </div>
                    <Badge className={statusColors[task.status]}>
                      {statusLabels[task.status] || task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p><strong>Problem:</strong> {task.problem_reported}</p>

                  {task.accessories_received && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <strong>Accessories:</strong> {task.accessories_received}
                    </p>
                  )}

                  {task.status === 'rejected' && task.rejection_reason && (
                    <div className="p-3 rounded bg-destructive/10 border border-destructive/30 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                        <p className="text-sm">{task.rejection_reason}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Quick Status Update */}
                    {!['submitted', 'approved'].includes(task.status) && (
                      <Select
                        value={task.status}
                        onValueChange={(v) => updateTaskMutation.mutate({ taskId: task.id, status: v })}
                      >
                        <SelectTrigger className="w-[180px] bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Pending</SelectItem>
                          <SelectItem value="working">In Progress</SelectItem>
                          <SelectItem value="problem_found">Problem Found</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Submit for Review */}
                    {task.status === 'completed' && (
                      <Button
                        variant="glow"
                        size="sm"
                        className="gap-1"
                        onClick={() => updateTaskMutation.mutate({ taskId: task.id, status: 'submitted' })}
                      >
                        <Send className="w-3 h-3" /> Submit for Review
                      </Button>
                    )}

                    {/* Open Job Sheet */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 ml-auto"
                      onClick={() => navigate(`/staff/task/${task.id}`)}
                    >
                      <FileText className="w-3 h-3" /> Job Sheet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;
