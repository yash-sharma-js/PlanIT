
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  tasks: number;
  completedTasks: number;
  assignedUsers: string[];
  status: string;
}

interface Task {
  id: string;
  title: string;
  project: string;
  project_id: string;
  dueDate: string;
  priority: string;
  status: string;
  assignedTo: string;
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  date: string;
  participants: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    inProgressTasks: 0,
    upcomingMeetings: 0,
    avgCompletion: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch team memberships to get projects the user is part of
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select('project_id')
        .eq('user_name', user?.userName);
      
      if (membershipError) throw membershipError;
      
      if (!teamMemberships || teamMemberships.length === 0) {
        setTasks([]);
        setProjects([]);
        setLoading(false);
        return;
      }
      
      const projectIds = teamMemberships.map(tm => tm.project_id);
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);
      
      if (projectsError) throw projectsError;
      
      // Fetch tasks from all projects
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, projects:project_id(title)')
        .in('project_id', projectIds)
        .eq('assignee', user?.userName)
        .order('due_date', { ascending: true });
      
      if (tasksError) throw tasksError;
      
      // Format tasks
      const formattedTasks = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        project: task.projects?.title || 'Unknown Project',
        project_id: task.project_id,
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignee
      }));
      
      // Limit to 4 most recent tasks for display
      setTasks(formattedTasks.slice(0, 4));
      
      // Process project data to include task counts
      const processedProjects = await Promise.all(projectsData.map(async (project) => {
        // Count total tasks for this project
        const { count: totalTasks, error: totalError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);
        
        // Count completed tasks for this project
        const { count: completedTasks, error: completedError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('status', 'completed');
        
        // Get team members for this project
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('user_name')
          .eq('project_id', project.id);
        
        if (totalError || completedError || membersError) throw new Error("Error fetching project details");
        
        return {
          id: project.id,
          title: project.title,
          description: project.description,
          progress: project.progress,
          tasks: totalTasks || 0,
          completedTasks: completedTasks || 0,
          assignedUsers: members?.map(m => m.user_name) || [],
          status: project.status
        };
      }));
      
      // Limit to 3 projects for display
      setProjects(processedProjects.slice(0, 3));
      
      // Calculate statistics
      const totalProjects = projectsData.length;
      const activeTasks = formattedTasks.length;
      const inProgressTasks = formattedTasks.filter(t => t.status === 'in-progress').length;
      
      // Calculate average completion percentage across all projects
      let totalProgress = 0;
      projectsData.forEach(p => {
        totalProgress += p.progress;
      });
      const avgCompletion = projectsData.length > 0 ? Math.round(totalProgress / projectsData.length) : 0;
      
      setStats({
        totalProjects,
        activeTasks,
        inProgressTasks,
        upcomingMeetings: 0, // No meetings data in database yet
        avgCompletion
      });
      
      // For now, use mock meetings data until we add a meetings table
      setMeetings([
        {
          id: "1",
          title: "Weekly Team Standup",
          time: "09:30 AM - 10:00 AM",
          date: "2023-10-16",
          participants: 8,
        },
        {
          id: "2",
          title: "Product Review",
          time: "11:00 AM - 12:00 PM",
          date: "2023-10-16",
          participants: 5,
        },
        {
          id: "3",
          title: "Client Presentation",
          time: "02:00 PM - 03:30 PM",
          date: "2023-10-17",
          participants: 4,
        },
      ]);
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProjects > 0 ? "Active projects" : "No projects yet"}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgressTasks} in progress
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
            <p className="text-xs text-muted-foreground">
              {meetings.filter((m) => new Date(m.date) > new Date()).length} upcoming
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel glass-panel-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Completion
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              Project completion average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Tasks List */}
        <Card className="glass-panel md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Pending Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/pending-tasks")}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Your upcoming tasks that need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-4 p-2 rounded-md bg-card/70 hover:bg-card/90 transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-medium leading-none text-sm">
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {task.project}
                    </p>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{task.dueDate ? formatDate(task.dueDate) : "No due date"}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No pending tasks
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/projects")}>
              <Plus className="mr-2 h-4 w-4" />
              Manage Tasks
            </Button>
          </CardFooter>
        </Card>

        {/* Meetings List */}
        <Card className="glass-panel md:col-span-1 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Meetings</CardTitle>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/meetings")}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Your upcoming meetings and events
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-start space-x-4 p-2 rounded-md bg-card/70 hover:bg-card/90 transition-colors">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-medium leading-none text-sm">
                        {meeting.title}
                      </h3>
                    </div>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{meeting.time}</span>
                    </div>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      <span>{meeting.participants} participants</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/meetings")}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </CardFooter>
        </Card>

        {/* Project Progress */}
        <Card className="glass-panel md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Project Progress</CardTitle>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/projects")}>
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Status of your active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-4">
              {projects.length > 0 ? projects.map((project) => (
                <div key={project.id} className="space-y-2 p-2 rounded-md bg-card/70 hover:bg-card/90 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate leading-none text-sm">
                      {project.title}
                    </h3>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.completedTasks} of {project.tasks} tasks completed</span>
                    <span className="truncate ml-2">Status: {project.status}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center p-4 text-muted-foreground">
                  No active projects
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
