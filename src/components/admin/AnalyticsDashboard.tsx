import { useQuery } from '@tanstack/react-query';
import { tasksAPI, profilesAPI } from '@/integrations/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Users, ClipboardList, Trophy, Flame } from 'lucide-react';

interface Task {
  id: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const AnalyticsDashboard = () => {
  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'all-analytics'],
    queryFn: async () => {
      return await tasksAPI.getAll() as Task[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return await profilesAPI.getAll() as Profile[];
    },
  });

  if (tasksLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
    );
  }

  const tasks = allTasks || [];

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'approved').length;
  const pendingTasks = tasks.filter(t => ['not_started', 'working', 'problem_found', 'completed', 'submitted'].includes(t.status)).length;
  const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
  const notStartedTasks = tasks.filter(t => t.status === 'not_started').length;
  const workingTasks = tasks.filter(t => t.status === 'working').length;
  const problemFoundTasks = tasks.filter(t => t.status === 'problem_found').length;
  const submittedTasks = tasks.filter(t => t.status === 'submitted').length;

  // Status distribution for pie chart
  const statusData = [
    { name: 'Approved', value: completedTasks, color: '#00C49F' },
    { name: 'Submitted', value: submittedTasks, color: '#0088FE' },
    { name: 'Working', value: workingTasks, color: '#FFBB28' },
    { name: 'Problem Found', value: problemFoundTasks, color: '#FF6B35' },
    { name: 'Not Started', value: notStartedTasks, color: '#8884d8' },
    { name: 'Rejected', value: rejectedTasks, color: '#FF8042' },
  ].filter(item => item.value > 0);

  // Tasks by status for bar chart
  const statusBarData = [
    { name: 'Not Started', value: notStartedTasks },
    { name: 'Working', value: workingTasks },
    { name: 'Problem Found', value: problemFoundTasks },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
    { name: 'Submitted', value: submittedTasks },
    { name: 'Approved', value: completedTasks },
    { name: 'Rejected', value: rejectedTasks },
  ];

  // Staff performance
  const staffPerformance = profiles?.map(profile => {
    const staffTasks = tasks.filter(t => t.assigned_to === profile.id);
    const completed = staffTasks.filter(t => t.status === 'approved').length;
    const total = staffTasks.length;

    // Calculate streak
    const activeDates = new Set<string>();
    staffTasks.forEach(t => {
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

    return {
      name: profile.full_name || profile.email,
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      streak
    };
  }).filter(s => s.total > 0) || [];

  const rankedStaffPerformance = [...staffPerformance].sort((a, b) => {
    if (b.completed !== a.completed) {
      return b.completed - a.completed;
    }
    return b.streak - a.streak;
  }).map((staff, index) => ({
    ...staff,
    rank: index + 1
  }));

  // Tasks over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const tasksOverTime = last7Days.map(date => {
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at).toISOString().split('T')[0];
      return taskDate === date;
    });
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'approved').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">All tasks in system</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks in progress</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{rejectedTasks}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Task Timeline (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#00C49F" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">Staff Performance Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            {rankedStaffPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rankedStaffPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No staff performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Table */}
      {rankedStaffPerformance.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Staff Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 w-16">Rank</th>
                    <th className="text-left p-3">Staff Member</th>
                    <th className="text-center p-3">Streak</th>
                    <th className="text-center p-3">Total Tasks</th>
                    <th className="text-center p-3">Completed</th>
                    <th className="text-center p-3">Pending</th>
                    <th className="text-center p-3">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedStaffPerformance.map((staff) => (
                    <tr key={staff.name} className="border-b border-border/30 hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-bold text-lg">
                        {staff.rank === 1 ? <span className="text-yellow-500" title="1st Place">🥇 1</span> :
                          staff.rank === 2 ? <span className="text-gray-400" title="2nd Place">🥈 2</span> :
                            staff.rank === 3 ? <span className="text-amber-600" title="3rd Place">🥉 3</span> :
                              <span className="text-muted-foreground">#{staff.rank}</span>}
                      </td>
                      <td className="p-3 font-medium">{staff.name}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full w-fit mx-auto">
                          <Flame className="w-4 h-4" /> {staff.streak}
                        </div>
                      </td>
                      <td className="p-3 text-center">{staff.total}</td>
                      <td className="p-3 text-center text-green-500 font-bold">{staff.completed}</td>
                      <td className="p-3 text-center text-yellow-500">{staff.pending}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {staff.completionRate}%
                          {staff.completionRate >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

