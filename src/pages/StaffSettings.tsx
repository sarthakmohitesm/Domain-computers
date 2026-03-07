import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, ArrowLeft, Lock, User, Mail } from 'lucide-react';

const StaffSettings = () => {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match.',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword(currentPassword, newPassword);
            toast({
                title: 'Password Changed',
                description: 'Your password has been updated successfully.',
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to change password.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const backPath = role === 'admin' ? '/admin' : '/staff';

    return (
        <div className="min-h-screen bg-background">
            <header className="glass sticky top-0 z-50 border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Cpu className="w-6 h-6 text-primary" />
                    <span className="font-display font-bold text-lg">Settings</span>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="space-y-6">
                    {/* Profile Info */}
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                                <p className="flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4 text-primary" />
                                    {user?.email || 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Role</label>
                                <p className="mt-1 capitalize font-medium">{role || 'Unknown'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Password */}
                    <Card className="glass border-border/50">
                        <CardHeader>
                            <CardTitle className="font-display text-xl flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        placeholder="Enter current password"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="Enter new password (min. 6 characters)"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm new password"
                                        className="bg-background/50"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="glow"
                                    className="w-full gap-2"
                                    disabled={isLoading}
                                >
                                    <Lock className="w-4 h-4" />
                                    {isLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default StaffSettings;
