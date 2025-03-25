
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Sample project data
const MOCK_PROJECTS = [
  {
    id: "1",
    title: "Marketing Website Redesign",
    description: "Complete overhaul of the company marketing website with new branding and improved user experience.",
    startDate: "2023-09-15",
    dueDate: "2023-11-30",
    status: "in-progress",
    priority: "high",
    progress: 65,
    tasks: {
      total: 24,
      completed: 16,
    },
    team: ["John Doe", "Jane Smith", "Robert Johnson"],
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Develop a cross-platform mobile app for customer engagement with personalized experiences.",
    startDate: "2023-08-01",
    dueDate: "2023-12-15",
    status: "in-progress",
    priority: "medium",
    progress: 30,
    tasks: {
      total: 36,
      completed: 11,
    },
    team: ["Alice Williams", "David Brown", "Emily Davis"],
  },
  {
    id: "3",
    title: "API Gateway Project",
    description: "Implement a new API gateway to streamline communication between microservices.",
    startDate: "2023-10-01",
    dueDate: "2023-12-01",
    status: "planning",
    priority: "medium",
    progress: 10,
    tasks: {
      total: 18,
      completed: 2,
    },
    team: ["Michael Wilson", "Sarah Miller"],
  },
  {
    id: "4",
    title: "Customer Portal Upgrade",
    description: "Enhance the customer portal with advanced analytics and reporting capabilities.",
    startDate: "2023-09-20",
    dueDate: "2024-01-15",
    status: "in-progress",
    priority: "high",
    progress: 25,
    tasks: {
      total: 30,
      completed: 8,
    },
    team: ["Thomas Anderson", "Lisa Taylor", "James Martin"],
  },
  {
    id: "5",
    title: "Internal Documentation System",
    description: "Create a comprehensive internal documentation system for better knowledge sharing.",
    startDate: "2023-10-10",
    dueDate: "2023-11-15",
    status: "completed",
    priority: "low",
    progress: 100,
    tasks: {
      total: 12,
      completed: 12,
    },
    team: ["Patricia White", "Richard Lee"],
  },
  {
    id: "6",
    title: "Security Compliance Audit",
    description: "Conduct a thorough security audit to ensure compliance with industry standards.",
    startDate: "2023-10-05",
    dueDate: "2023-10-25",
    status: "planning",
    priority: "high",
    progress: 5,
    tasks: {
      total: 15,
      completed: 0,
    },
    team: ["Daniel Clark", "Jennifer Lewis"],
  },
];

const Projects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<typeof MOCK_PROJECTS>([]);
  const [filteredProjects, setFilteredProjects] = useState<typeof MOCK_PROJECTS>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setFilteredProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...projects];

    // Apply search
    if (searchQuery) {
      result = result.filter(
        project =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(project => project.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      result = result.filter(project => project.priority === priorityFilter);
    }

    // Apply sorting
    if (sortOption) {
      switch (sortOption) {
        case "name-asc":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "date-asc":
          result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          break;
        case "date-desc":
          result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
          break;
        case "progress-asc":
          result.sort((a, b) => a.progress - b.progress);
          break;
        case "progress-desc":
          result.sort((a, b) => b.progress - a.progress);
          break;
        default:
          break;
      }
    }

    setFilteredProjects(result);
  }, [projects, searchQuery, statusFilter, priorityFilter, sortOption]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setPriorityFilter(null);
    setSortOption(null);
    setFilteredProjects(projects);
    toast.success("Filters have been reset");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your projects
          </p>
        </div>
        <Button onClick={() => navigate("/projects/new")} className="md:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={statusFilter === "planning" ? "bg-accent" : ""}
                onClick={() => setStatusFilter("planning")}
              >
                Planning
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={statusFilter === "in-progress" ? "bg-accent" : ""}
                onClick={() => setStatusFilter("in-progress")}
              >
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={statusFilter === "completed" ? "bg-accent" : ""}
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={statusFilter === "on-hold" ? "bg-accent" : ""}
                onClick={() => setStatusFilter("on-hold")}
              >
                On Hold
              </DropdownMenuItem>
              {statusFilter && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setStatusFilter(null)}
                  >
                    Clear Filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={priorityFilter === "high" ? "bg-accent" : ""}
                onClick={() => setPriorityFilter("high")}
              >
                High
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={priorityFilter === "medium" ? "bg-accent" : ""}
                onClick={() => setPriorityFilter("medium")}
              >
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={priorityFilter === "low" ? "bg-accent" : ""}
                onClick={() => setPriorityFilter("low")}
              >
                Low
              </DropdownMenuItem>
              {priorityFilter && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setPriorityFilter(null)}
                  >
                    Clear Filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={sortOption === "name-asc" ? "bg-accent" : ""}
                onClick={() => setSortOption("name-asc")}
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOption === "name-desc" ? "bg-accent" : ""}
                onClick={() => setSortOption("name-desc")}
              >
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOption === "date-asc" ? "bg-accent" : ""}
                onClick={() => setSortOption("date-asc")}
              >
                Due Date (Earliest)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOption === "date-desc" ? "bg-accent" : ""}
                onClick={() => setSortOption("date-desc")}
              >
                Due Date (Latest)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOption === "progress-asc" ? "bg-accent" : ""}
                onClick={() => setSortOption("progress-asc")}
              >
                Progress (Lowest)
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOption === "progress-desc" ? "bg-accent" : ""}
                onClick={() => setSortOption("progress-desc")}
              >
                Progress (Highest)
              </DropdownMenuItem>
              {sortOption && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setSortOption(null)}
                  >
                    Clear Sort
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchQuery || statusFilter || priorityFilter || sortOption) && (
            <Button variant="ghost" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="glass-panel glass-panel-hover overflow-hidden"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(project.status)}
                      {getPriorityBadge(project.priority)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <CardDescription className="line-clamp-2 min-h-[40px]">
                    {project.description}
                  </CardDescription>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      <span>
                        {project.tasks.completed}/{project.tasks.total} tasks
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>{formatDate(project.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <div className="w-full flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {project.team.length} team members
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No projects found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              We couldn't find any projects matching your criteria.
            </p>
            <Button onClick={resetFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
