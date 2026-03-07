import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StaffManagement } from '@/components/admin/StaffManagement';
import { TaskCreation } from '@/components/admin/TaskCreation';
import { TaskBucket } from '@/components/admin/TaskBucket';
import { StaffDropZone } from '@/components/admin/StaffDropZone';
import { TaskOverview } from '@/components/admin/TaskOverview';
import { TaskReview } from '@/components/admin/TaskReview';
import { ApprovedTasks } from '@/components/admin/ApprovedTasks';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { Cpu, LogOut, Users, ClipboardList, CheckSquare, Award, BarChart3, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignTaskMutation = useMutation({
    mutationFn: async ({ taskId, staffId, isReassignment }: { taskId: string; staffId: string; isReassignment: boolean }) => {
      await tasksAPI.update(taskId, { assigned_to: staffId });
      return { isReassignment };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.isReassignment) {
        toast({ title: 'Task Reassigned', description: 'Task has been reassigned to the staff member.' });
      } else {
        toast({ title: 'Task Assigned', description: 'Task has been assigned to staff member.' });
      }
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current?.task) {
      const task = active.data.current.task;
      const isReassignment = !!task.assigned_to && task.assigned_to !== over.id;
      assignTaskMutation.mutate({
        taskId: active.id as string,
        staffId: over.id as string,
        isReassignment
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-lg">Admin Dashboard</span>
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
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="glass flex-wrap">
            <TabsTrigger value="tasks" className="gap-2"><ClipboardList className="w-4 h-4" />Tasks</TabsTrigger>
            <TabsTrigger value="staff" className="gap-2"><Users className="w-4 h-4" />Staff</TabsTrigger>
            <TabsTrigger value="review" className="gap-2"><CheckSquare className="w-4 h-4" />Review</TabsTrigger>
            <TabsTrigger value="approved" className="gap-2"><Award className="w-4 h-4" />Completed</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <DndContext onDragEnd={handleDragEnd}>
              <div className="space-y-6">
                <TaskCreation />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TaskBucket />
                  <StaffDropZone />
                </div>
                <TaskOverview />
              </div>
            </DndContext>
          </TabsContent>

          <TabsContent value="staff"><StaffManagement /></TabsContent>
          <TabsContent value="review"><TaskReview /></TabsContent>
          <TabsContent value="approved"><ApprovedTasks /></TabsContent>
          <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
