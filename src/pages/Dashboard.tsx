import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppNavigation } from "@/hooks/use-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/middleware";
import { useAuth } from "@/context/AuthContext";
import { CheckSquare, Clock, AlertTriangle, FolderIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  project_id: string;
  project_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigation = useAppNavigation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select('project_id')
        .eq('user_name', user?.userName);
      
      if (membershipError) throw membershipError;
      
      if (!teamMemberships || teamMemberships.length === 0) {
        setIsLoading(false);
        return;
      }
      
      const projectIds = teamMemberships.map(tm => tm.project_id);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          priority,
          status,
          due_date,
          project_id,
          projects:project_id (title)
        `)
        .in('project_id', projectIds)
        .eq('assignee', user?.userName)
        .order('due_date', { ascending: true })
        .limit(5);
      
      if (tasksError) throw tasksError;
      
      const formattedTasks = (tasksData || []).map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        project_id: task.project_id,
        project_name: task.projects?.title || 'Unknown Project'
      }));
      
      setTasks(formattedTasks);
      
      const completedTasks = (tasksData || []).filter(t => t.status === 'completed').length;
      const pendingTasks = (tasksData || []).length - completedTasks;
      const highPriorityTasks = (tasksData || []).filter(t => t.priority === 'high' && t.status !== 'completed').length;
      
      setStats({
        totalProjects: projectsData?.length || 0,
        completedTasks,
        pendingTasks,
        highPriorityTasks
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="capitalize">{priority}</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 capitalize">{priority}</Badge>;
      case "low":
        return <Badge variant="outline" className="capitalize">{priority}</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{priority}</Badge>;
    }
  };

  const projectChartData = projects.map(project => ({
    name: project.title,
    tasks: 5,
    meetings: 3
  }));

  const taskStatusData = [
    { name: 'Completed', value: stats.completedTasks },
    { name: 'Pending', value: stats.pendingTasks },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'User'}! Here's an overview of your projects and tasks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active projects you're contributing to
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks you've successfully completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks awaiting your attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks that need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Pending Tasks</CardTitle>
            <CardDescription>
              Recent tasks assigned to you that need attention
            </CardDescription>
          </div>
          <Link to="/pending-tasks">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>You're all caught up! No pending tasks.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {tasks.filter(task => task.status !== 'completed').slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="space-y-1 md:pr-10">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{task.project_name}</span>
                      {task.due_date && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          · Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/projects/${task.project_id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              ))}
              <div className="text-center pt-2 pb-2 md:hidden">
                <Link to="/pending-tasks">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Tasks
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created at: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/projects/${project.id}`}>
                    <Button>View Project</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Tasks and meetings per project</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" fill="#8884d8" />
                    <Bar dataKey="meetings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
                <CardDescription>Distribution of completed vs pending tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
