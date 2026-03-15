import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Cpu, ArrowLeft, Phone, Laptop, Package, AlertCircle,
  Send, MessageSquare, Clock, CheckCircle, FileText, Wrench
} from 'lucide-react';

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
  submitted: 'Submitted for Review',
  rejected: 'Rejected',
  approved: 'Approved',
};

interface Comment {
  userId: string;
  userEmail: string;
  userRole: string;
  text: string;
  timestamp: string;
}

const JobSheet = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [staffNotes, setStaffNotes] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      return await tasksAPI.getById(id!);
    },
    enabled: !!id,
    refetchInterval: 10000, // Real-time-like polling every 10s
  });

  useEffect(() => {
    if (task?.staff_notes) {
      setStaffNotes(task.staff_notes);
    }
  }, [task?.staff_notes]);

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await tasksAPI.update(id!, { status, staff_notes: staffNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({ title: 'Status Updated', description: 'Task status has been updated.' });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      await tasksAPI.update(id!, { status: 'submitted', staff_notes: staffNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast({ title: 'Task Submitted', description: 'Task has been submitted for admin review.' });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      await tasksAPI.addComment(id!, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setNewComment('');
      toast({ title: 'Comment Added' });
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      await tasksAPI.update(id!, { staff_notes: staffNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      toast({ title: 'Notes Saved' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Cpu className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Task not found</p>
      </div>
    );
  }

  const isEditable = !['submitted', 'approved'].includes(task.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <FileText className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-none">Job Sheet</span>
              <span className="text-[10px] font-mono font-bold text-primary mt-0.5">{task.task_id || 'N/A'}</span>
            </div>
          </div>
          <Badge className={statusColors[task.status]}>
            {statusLabels[task.status] || task.status}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Rejection Banner */}
          {task.status === 'rejected' && task.rejection_reason && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Task Rejected by Admin</p>
                <p className="text-sm mt-1">{task.rejection_reason}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please fix the issue and resubmit the task.
                </p>
              </div>
            </div>
          )}

          {/* Customer & Device Info */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Customer Name</label>
                    <p className="font-medium text-lg mt-1">{task.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <p className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-primary" />
                      {task.contact_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Created</label>
                    <p className="flex items-center gap-2 mt-1 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(task.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Device Type</label>
                    <p className="flex items-center gap-2 mt-1 font-medium text-lg">
                      <Laptop className="w-5 h-5 text-primary" />
                      {task.device_name}
                    </p>
                  </div>
                  {task.accessories_received && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Accessories Received</label>
                      <p className="flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4 text-primary" />
                        {task.accessories_received}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Problem Reported</label>
                    <p className="mt-1 p-3 rounded-lg bg-background/50 border border-border/30 text-sm">
                      {task.problem_reported}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Actions */}
          {isEditable && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Task Status</label>
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateStatusMutation.mutate(v)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Pending</SelectItem>
                        <SelectItem value="working">In Progress</SelectItem>
                        <SelectItem value="problem_found">Problem Found</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {task.status === 'completed' && (
                    <Button
                      variant="glow"
                      className="gap-2"
                      onClick={() => submitForReviewMutation.mutate()}
                      disabled={submitForReviewMutation.isPending}
                    >
                      <Send className="w-4 h-4" />
                      {submitForReviewMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Status */}
          {task.status === 'approved' && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-500">Task Completed & Approved</p>
                <p className="text-sm text-muted-foreground">
                  {task.completed_at
                    ? `Completed on ${new Date(task.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : 'This task has been approved by the admin.'}
                </p>
              </div>
            </div>
          )}

          {/* Submitted Status */}
          {task.status === 'submitted' && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-500" />
              <div>
                <p className="font-medium text-purple-500">Awaiting Admin Review</p>
                <p className="text-sm text-muted-foreground">
                  Your task has been submitted and is pending admin review.
                </p>
              </div>
            </div>
          )}

          {/* Repair Notes */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Repair Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Add repair notes, findings, parts used, etc..."
                className="bg-background/50 min-h-[120px]"
                disabled={!isEditable}
              />
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveNotesMutation.mutate()}
                  disabled={saveNotesMutation.isPending}
                >
                  {saveNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Comments Thread */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Comments
                {task.comments?.length > 0 && (
                  <Badge variant="outline" className="ml-2">{task.comments.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comments List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {(!task.comments || task.comments.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Add a comment to start the conversation.
                  </p>
                ) : (
                  task.comments.map((comment: Comment, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${comment.userRole === 'admin'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-background/50 border-border/30'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {comment.userEmail}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {comment.userRole}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {new Date(comment.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-background/50 min-h-[60px]"
                />
                <Button
                  variant="glow"
                  size="icon"
                  className="self-end h-10 w-10"
                  onClick={() => {
                    if (newComment.trim()) {
                      addCommentMutation.mutate(newComment.trim());
                    }
                  }}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JobSheet;
