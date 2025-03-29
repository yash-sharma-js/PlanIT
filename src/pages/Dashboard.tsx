
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

// Mock data for tasks
const MOCK_TASKS = [
  {
    id: "1",
    title: "Design landing page wireframes",
    project: "Marketing Website Redesign",
    dueDate: "2023-10-15",
    priority: "high",
    status: "in-progress",
    assignedTo: "demouser"
  },
  {
    id: "2",
    title: "Implement authentication flow",
    project: "Mobile App Development",
    dueDate: "2023-10-18",
    priority: "medium",
    status: "to-do",
    assignedTo: "demouser"
  },
  {
    id: "3",
    title: "Write API documentation",
    project: "API Gateway Project",
    dueDate: "2023-10-12",
    priority: "low",
    status: "in-progress",
    assignedTo: "demouser"
  },
  {
    id: "4",
    title: "Test checkout process",
    project: "E-commerce Platform",
    dueDate: "2023-10-20",
    priority: "high",
    status: "to-do",
    assignedTo: "demouser"
  },
];

// Mock data for meetings
const MOCK_MEETINGS = [
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
];

// Mock data for projects
const MOCK_PROJECTS = [
  {
    id: "1",
    title: "Marketing Website Redesign",
    description: "Redesign the company marketing website with new branding",
    progress: 65,
    tasks: 12,
    completedTasks: 8,
    assignedUsers: ["demouser"]
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Build a cross-platform mobile app for customer engagement",
    progress: 30,
    tasks: 24,
    completedTasks: 7,
    assignedUsers: ["demouser"]
  },
  {
    id: "3",
    title: "API Gateway Project",
    description: "Implement a new API gateway for microservices architecture",
    progress: 80,
    tasks: 16,
    completedTasks: 13,
    assignedUsers: ["demouser"]
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<typeof MOCK_TASKS>([]);
  const [meetings, setMeetings] = useState<typeof MOCK_MEETINGS>([]);
  const [projects, setProjects] = useState<typeof MOCK_PROJECTS>([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setTasks(MOCK_TASKS);
      setMeetings(MOCK_MEETINGS);
      setProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
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
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === "in-progress").length} in progress
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
            <div className="text-2xl font-bold">58%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last month
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
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/projects")}>
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
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-medium leading-none text-sm">
                        {task.title}
                      </h3>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.project}
                    </p>
                    <div className="flex items-center pt-1 text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{formatDate(task.dueDate)}</span>
                      <span className="mx-1">•</span>
                      <span>Assigned to: @{task.assignedTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
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
                <div key={meeting.id} className="flex items-start space-x-4">
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
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate leading-none text-sm">
                      {project.title}
                    </h3>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.completedTasks} of {project.tasks} tasks completed</span>
                    <span>Assigned to: @{project.assignedUsers.join(', @')}</span>
                  </div>
                </div>
              ))}
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
