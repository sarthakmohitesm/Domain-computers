import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, profilesAPI } from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Cpu, ArrowLeft, Phone, Laptop, Package, AlertCircle,
  Send, MessageSquare, Clock, CheckCircle, XCircle, FileText,
  Wrench, User, Printer
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const AdminJobSheet = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      return await tasksAPI.getById(id!);
    },
    enabled: !!id,
    refetchInterval: 10000,
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await profilesAPI.getAll();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await tasksAPI.update(id!, { status: 'approved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task Approved', description: 'Task has been completed and approved.' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      await tasksAPI.update(id!, { status: 'rejected', rejection_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
      toast({ title: 'Task Rejected', description: 'Task returned to staff with feedback.' });
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

  const getStaffName = (staffId: string | null) => {
    if (!staffId || !profiles) return 'Unassigned';
    const profile = (profiles as any[]).find((p: any) => p.id === staffId);
    return profile?.full_name || profile?.email || 'Unknown';
  };

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <FileText className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg">Job Sheet (Admin View)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 hidden sm:flex">
              <Printer className="w-4 h-4" /> Print Sheet
            </Button>
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status] || task.status}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Task Details */}
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
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</label>
                    <p className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-primary" />
                      {getStaffName(task.assigned_to)}
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
                  {task.completed_at && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">Completed On</label>
                      <p className="flex items-center gap-2 mt-1 text-sm text-green-500">
                        <CheckCircle className="w-4 h-4" />
                        {new Date(task.completed_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Notes */}
          {task.staff_notes && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Staff Repair Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-sm whitespace-pre-wrap">{task.staff_notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions (for submitted tasks) */}
          {task.status === 'submitted' && (
            <Card className="glass border-primary/20 glow-border">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Review Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review the task details and staff notes, then approve or reject the submission.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="glow"
                    className="gap-2"
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve Task'}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection History */}
          {task.rejection_reason && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Rejection Note</p>
                <p className="text-sm mt-1">{task.rejection_reason}</p>
              </div>
            </div>
          )}

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
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {(!task.comments || task.comments.length === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet.
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
                        <span className="text-xs font-medium">{comment.userEmail}</span>
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle className="font-display">Reject Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this task. The staff member will see this feedback.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (rejectionReason.trim()) {
                    rejectMutation.mutate(rejectionReason);
                  }
                }}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only Job Sheet Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-jobsheet, #printable-jobsheet * {
            visibility: visible;
          }
          #printable-jobsheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            color: black !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Minimalistic Printable Job Sheet */}
      <div id="printable-jobsheet" className="hidden print:block">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold uppercase">Job Repair Sheet</h1>
            <p className="text-sm">ID: {task.id}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">STATUS: {statusLabels[task.status]?.toUpperCase()}</p>
            <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Customer details</h2>
            <div className="space-y-1">
              <p><strong>Name:</strong> {task.customer_name}</p>
              <p><strong>Contact:</strong> {task.contact_number}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Employee details</h2>
            <div className="space-y-1">
              <p><strong>Assigned To:</strong> {getStaffName(task.assigned_to)}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold border-b border-black mb-2 uppercase">Device & problem details</h2>
          <div className="space-y-2">
            <p><strong>Device:</strong> {task.device_name}</p>
            <p><strong>Accessories:</strong> {task.accessories_received || 'None'}</p>
            <div className="mt-4 p-4 border border-black min-h-[100px]">
              <p className="text-sm font-bold mb-1 underline">Problem Reported:</p>
              <p>{task.problem_reported}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="p-4 border border-black min-h-[150px]">
                <p className="text-sm font-bold mb-1 underline">Technician Notes:</p>
                <p className="text-sm whitespace-pre-wrap">{task.staff_notes || ''}</p>
            </div>
            <div className="p-4 border border-black min-h-[150px] flex flex-col justify-between">
                <div>
                   <p className="text-sm font-bold mb-1 underline">Customer Signature:</p>
                </div>
                <div className="border-t border-black pt-2 text-center text-[10px]">
                    I verify that the above information is correct.
                </div>
            </div>
        </div>

        <div className="text-center text-[10px] text-gray-500 mt-20 border-t pt-2">
           Generated from Digital Haven Management System
        </div>
      </div>
    </div>
  );
};

export default AdminJobSheet;
