import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profilesAPI, tasksAPI } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Activity, CheckCircle, Clock, AlertCircle, TrendingUp, Flame, Wrench } from 'lucide-react';

export default function AdminStaffProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['profile', id],
        queryFn: () => profilesAPI.getById(id!),
        enabled: !!id,
    });

    const { data: tasks, isLoading: isTasksLoading } = useQuery({
        queryKey: ['tasks', 'staff', id],
        queryFn: () => tasksAPI.search('', { assigned_to: id }),
        enabled: !!id,
    });

    if (isProfileLoading || isTasksLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading employee data...</div>;
    }

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Employee not found</h2>
                <Button onClick={() => navigate('/admin')}>Return to Dashboard</Button>
            </div>
        );
    }

    const staffTasks = tasks || [];
    const completedTasks = staffTasks.filter((t: any) => t.status === 'approved');
    const pendingTasks = staffTasks.filter((t: any) => !['approved', 'rejected'].includes(t.status));
    const rejectedTasks = staffTasks.filter((t: any) => t.status === 'rejected');

    const completionRate = staffTasks.length > 0
        ? Math.round((completedTasks.length / staffTasks.length) * 100)
        : 0;

    // Streak calculation
    const activeDates = new Set<string>();
    staffTasks.forEach((t: any) => {
        if (t.created_at) activeDates.add(new Date(t.created_at).toISOString().split('T')[0]);
        if (t.updated_at) activeDates.add(new Date(t.updated_at).toISOString().split('T')[0]);
        if (t.completed_at) activeDates.add(new Date(t.completed_at).toISOString().split('T')[0]);
    });

    const sortedDates = Array.from(activeDates).sort((a, b) => b.localeCompare(a));
    let streak = 0;

    if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (sortedDates[0] === today || sortedDates[0] === yesterday) {
            streak = 1;
            let currentDate = new Date(sortedDates[0]);

            for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(currentDate);
                prevDate.setDate(prevDate.getDate() - 1);
                const expectedDateStr = prevDate.toISOString().split('T')[0];

                if (sortedDates[i] === expectedDateStr) {
                    streak++;
                    currentDate = prevDate;
                } else {
                    break;
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="glass sticky top-0 z-50 border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-primary" />
                        <span className="font-display font-bold text-lg">Employee Details</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">

                {/* Profile Header */}
                <Card className="glass border-border/50 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5"></div>
                    <CardContent className="px-6 pb-6 pt-0 relative">
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-10">
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-xl overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.full_name || 'Employee'} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-10 h-10 text-primary" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl font-display font-bold">{profile.full_name || 'Unnamed Employee'}</h1>
                                    <Badge variant={profile.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                        {profile.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-6 text-muted-foreground flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        <span>Joined: {new Date(profile.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="glass border-border/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                                    <h3 className="text-3xl font-bold">{staffTasks.length}</h3>
                                </div>
                                <Wrench className="w-5 h-5 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                                    <h3 className="text-3xl font-bold text-green-500">{completedTasks.length}</h3>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                                    <h3 className="text-3xl font-bold text-yellow-500">{pendingTasks.length}</h3>
                                </div>
                                <Clock className="w-5 h-5 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Success Rate</p>
                                    <div className="flex items-end gap-2">
                                        <h3 className="text-3xl font-bold">{completionRate}%</h3>
                                        {completionRate >= 80 ? <TrendingUp className="w-4 h-4 text-green-500 mb-2" /> : null}
                                    </div>
                                </div>
                                <Activity className="w-5 h-5 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass border-border/50 bg-orange-500/5 border-orange-500/20">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-orange-500/80 mb-1">Current Streak</p>
                                    <h3 className="text-3xl font-bold text-orange-500">{streak} Days</h3>
                                </div>
                                <Flame className="w-6 h-6 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Task History */}
                <Card className="glass border-border/50">
                    <CardHeader>
                        <CardTitle className="font-display text-xl">Recent Tasks Assigned</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {staffTasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No tasks assigned to this employee yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/50 text-sm">
                                            <th className="text-left p-3 font-medium text-muted-foreground">Customer</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Device</th>
                                            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                            <th className="text-right p-3 font-medium text-muted-foreground">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffTasks.slice(0, 10).map((task: any) => (
                                            <tr key={task.id} className="border-b border-border/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/admin/task/${task.id}`)}>
                                                <td className="p-3 font-medium">{task.customer_name}</td>
                                                <td className="p-3">{task.device_name}</td>
                                                <td className="p-3">
                                                    <Badge variant="outline" className={
                                                        task.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            task.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }>
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right text-muted-foreground text-sm">
                                                    {new Date(task.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {staffTasks.length > 10 && (
                                    <p className="text-center text-sm text-muted-foreground mt-4">
                                        Showing 10 most recent tasks.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}
