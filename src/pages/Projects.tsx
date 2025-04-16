import { useState, useEffect, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

interface Project {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  due_date: string;
  status: string;
  priority: string;
  progress: number;
  team: string[];
  tasks: {
    total: number;
    completed: number;
  };
}

const ITEMS_PER_PAGE = 9;

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        toast.error("Error loading projects");
        console.error('Error fetching projects:', projectsError);
        return;
      }

      const projectsWithDetails = await Promise.all(
        projectsData.map(async (project) => {
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('user_name')
            .eq('project_id', project.id);

          const { data: tasksData } = await supabase
            .from('tasks')
            .select('status')
            .eq('project_id', project.id);

          const totalTasks = tasksData?.length || 0;
          const completedTasks = tasksData?.filter(task => task.status === 'completed')?.length || 0;
          
          return {
            ...project,
            team: teamMembers?.map(member => member.user_name) || [],
            tasks: {
              total: totalTasks,
              completed: completedTasks
            }
          };
        })
      );

      setProjects(prev => [...prev, ...projectsWithDetails]);
      setHasMore(projectsData.length === ITEMS_PER_PAGE);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error in loadMore:', error);
      toast.error("Failed to load more projects");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  const observerRef = useInfiniteScroll(loadMore);

  useEffect(() => {
    setProjects([]);
    setPage(0);
    setHasMore(true);
    loadMore();
  }, [searchQuery, statusFilter, priorityFilter, sortOption]);

  useEffect(() => {
    let result = [...projects];

    if (searchQuery) {
      result = result.filter(
        project =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter) {
      result = result.filter(project => project.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter(project => project.priority === priorityFilter);
    }

    if (sortOption) {
      switch (sortOption) {
        case "name-asc":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "date-asc":
          result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
          break;
        case "date-desc":
          result.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
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

  if (loading && projects.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        <div className="flex flex-wrap gap-3">
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

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length > 0 ? (
            <>
              {filteredProjects.map((project) => (
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
                          <span>{formatDate(project.due_date)}</span>
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
              ))}
              {hasMore && (
                <div ref={observerRef} className="col-span-full flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </>
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
      </ScrollArea>
    </div>
  );
};

export default Projects;
