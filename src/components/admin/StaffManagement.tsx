import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  status: 'active' | 'disabled';
}

export const StaffManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staff-members'],
    queryFn: async () => {
      return await staffAPI.getAll() as StaffMember[];
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
      return await staffAPI.create({ email, password, full_name: fullName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      setIsDialogOpen(false);
      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffPassword('');
      toast({
        title: 'Staff Added',
        description: 'New staff member has been created successfully.',
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

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'disabled' }) => {
      await staffAPI.updateStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast({
        title: 'Status Updated',
        description: 'Staff member status has been updated.',
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (userId: string) => {
      await staffAPI.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-members'] });
      toast({
        title: 'Staff Removed',
        description: 'Staff member has been removed.',
      });
    },
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate({
      email: newStaffEmail,
      password: newStaffPassword,
      fullName: newStaffName,
    });
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl">Staff Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="glow" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name</Label>
                <Input
                  id="staff-name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50"
                />
              </div>
              <Button
                type="submit"
                variant="glow"
                className="w-full"
                disabled={createStaffMutation.isPending}
              >
                {createStaffMutation.isPending ? 'Creating...' : 'Create Staff Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
        ) : !staffMembers || staffMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No staff members yet. Add your first staff member.
          </div>
        ) : (
          <div className="space-y-3">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
              >
                <div>
                  <p className="font-medium">{staff.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">{staff.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                    {staff.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: staff.id,
                        newStatus: staff.status === 'active' ? 'disabled' : 'active',
                      })
                    }
                    title={staff.status === 'active' ? "Disable Staff" : "Activate Staff"}
                  >
                    {staff.status === 'active' ? (
                      <ToggleRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 hidden sm:flex"
                    onClick={() => navigate(`/admin/staff/${staff.id}`)}
                  >
                    View Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteStaffMutation.mutate(staff.id)}
                    title="Remove Staff"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
