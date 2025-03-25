
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  UserPlus,
  AlertCircle,
  MoreHorizontal,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock data - in a real app, we would fetch this from an API
const MOCK_PROJECT = {
  id: "1",
  title: "Marketing Website Redesign",
  description: "Complete overhaul of the company marketing website with new branding and improved user experience. The project will focus on modern design principles, performance optimization, and better conversion rates.",
  startDate: "2023-09-15",
  dueDate: "2023-11-30",
  status: "in-progress",
  priority: "high",
  progress: 65,
  tasks: {
    total: 24,
    completed: 16,
  },
  team: [
    { id: "user1", name: "John Doe", role: "Project Manager", avatar: "" },
    { id: "user2", name: "Jane Smith", role: "UX Designer", avatar: "" },
    { id: "user3", name: "Robert Johnson", role: "Frontend Developer", avatar: "" },
    { id: "user4", name: "Emily Davis", role: "Content Writer", avatar: "" },
  ],
};

const MOCK_TASKS = [
  {
    id: "task1",
    title: "Create wireframes for homepage",
    description: "Design low-fidelity wireframes for the new homepage layout",
    assignee: "Jane Smith",
    dueDate: "2023-10-10",
    status: "completed",
    priority: "high",
  },
  {
    id: "task2",
    title: "Develop responsive navigation component",
    description: "Implement the responsive navigation menu with mobile support",
    assignee: "Robert Johnson",
    dueDate: "2023-10-20",
    status: "in-progress",
    priority: "high",
  },
  {
    id: "task3",
    title: "Write product description copy",
    description: "Create compelling copy for the product sections",
    assignee: "Emily Davis",
    dueDate: "2023-10-15",
    status: "in-progress",
    priority: "medium",
  },
  {
    id: "task4",
    title: "Set up analytics tracking",
    description: "Implement Google Analytics and conversion tracking",
    assignee: "John Doe",
    dueDate: "2023-11-05",
    status: "to-do",
    priority: "medium",
  },
  {
    id: "task5",
    title: "SEO optimization",
    description: "Optimize meta tags and content for search engines",
    assignee: "Emily Davis",
    dueDate: "2023-11-10",
    status: "to-do",
    priority: "high",
  },
];

const MOCK_ACTIVITIES = [
  {
    id: "act1",
    user: "John Doe",
    action: "created the project",
    date: "2023-09-15T10:30:00Z",
  },
  {
    id: "act2",
    user: "John Doe",
    action: "added Jane Smith to the project",
    date: "2023-09-15T11:15:00Z",
  },
  {
    id: "act3",
    user: "Jane Smith",
    action: "created task 'Create wireframes for homepage'",
    date: "2023-09-16T09:45:00Z",
  },
  {
    id: "act4",
    user: "Robert Johnson",
    action: "joined the project",
    date: "2023-09-18T14:20:00Z",
  },
  {
    id: "act5",
    user: "Jane Smith",
    action: "completed task 'Create wireframes for homepage'",
    date: "2023-10-02T16:30:00Z",
  },
  {
    id: "act6",
    user: "John Doe",
    action: "updated the project due date to Nov 30",
    date: "2023-10-05T11:00:00Z",
  },
  {
    id: "act7",
    user: "Emily Davis",
    action: "joined the project",
    date: "2023-10-08T09:15:00Z",
  },
];

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<typeof MOCK_PROJECT | null>(null);
  const [tasks, setTasks] = useState<typeof MOCK_TASKS>([]);
  const [activities, setActivities] = useState<typeof MOCK_ACTIVITIES>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // In a real app, we would fetch the project data from an API
    const timer = setTimeout(() => {
      setProject(MOCK_PROJECT);
      setTasks(MOCK_TASKS);
      setActivities(MOCK_ACTIVITIES);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Planning
        </Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>;
      case "completed":
        return <Badge className="bg-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>;
      case "on-hold":
        return <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          On Hold
        </Badge>;
      case "to-do":
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          To Do
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="uppercase text-[10px]">High</Badge>;
      case "medium":
        return <Badge variant="default" className="uppercase text-[10px] bg-orange-500">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="uppercase text-[10px]">Low</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px]">{priority}</Badge>;
    }
  };

  const handleAddTask = () => {
    toast.success("Task creation would open a form here");
  };

  const handleDeleteProject = () => {
    toast.error("This would delete the project in a real app");
    navigate("/projects");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Back Button and Project Title */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => navigate("/projects")}
            >
              <ArrowLeft className="h-4 w-4" />
              Projects
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight mr-2">{project.title}</h1>
            <div className="flex gap-2">
              {getStatusBadge(project.status)}
              {getPriorityBadge(project.priority)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" className="gap-1" onClick={() => navigate(`/projects/${id}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={handleDeleteProject}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel md:col-span-2">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Status</span>
                    <div>{getStatusBadge(project.status)}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Priority</span>
                    <div>{getPriorityBadge(project.priority)}</div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium">Timeline</span>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Tasks Completed</div>
                        <div className="text-2xl font-bold">{project.tasks.completed}/{project.tasks.total}</div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-muted-foreground">
                      {Math.round((project.tasks.completed / project.tasks.total) * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Recent Tasks</CardTitle>
                <Button size="sm" onClick={() => setActiveTab("tasks")}>View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-start space-x-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="truncate font-medium leading-none">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {task.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <span className="mr-3">Assigned to: {task.assignee}</span>
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          <Card className="glass-panel">
            <CardContent className="py-6">
              {tasks.length > 0 ? (
                <div className="space-y-6">
                  {tasks.map((task) => (
                    <div key={task.id} className="group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {task.status === "completed" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                  {task.title}
                                </h3>
                                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span>Assigned to: {task.assignee}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  <span>Due: {formatDate(task.dueDate)}</span>
                                </div>
                                <div className="flex gap-2">
                                  {getStatusBadge(task.status)}
                                  {getPriorityBadge(task.priority)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {task !== tasks[tasks.length - 1] && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">Get started by creating your first task</p>
                  <Button onClick={handleAddTask}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          <Card className="glass-panel">
            <CardContent className="py-6">
              <div className="space-y-6">
                {project.team.map((member) => (
                  <div key={member.id} className="group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    {member !== project.team[project.team.length - 1] && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="animate-fade-in">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>History of activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center z-10">
                      <span className="h-3 w-3 rounded-full bg-primary"></span>
                    </div>
                    <div className={`flex-1 flex flex-col space-y-1 pt-1 ${index === 0 ? 'animate-fade-in' : ''}`}>
                      <p className="font-medium">
                        <span className="text-primary">{activity.user}</span> {activity.action}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(activity.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
