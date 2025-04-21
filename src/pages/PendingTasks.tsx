
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  project_id: string;
  project_name: string;
  status: string;
}

const PendingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPendingTasks();
    }
  }, [user]);

  const fetchPendingTasks = async () => {
    try {
      setIsLoading(true);
      
      // Get team memberships to find all projects the user is part of
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select('project_id')
        .eq('user_name', user?.userName);
      
      if (membershipError) throw membershipError;
      
      if (!teamMemberships || teamMemberships.length === 0) {
        setTasks([]);
        setIsLoading(false);
        return;
      }
      
      // Get all project IDs the user is part of
      const projectIds = teamMemberships.map(tm => tm.project_id);
      
      // Get tasks from all these projects that are assigned to the user and not completed
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          due_date,
          priority,
          status,
          project_id,
          projects:project_id (title)
        `)
        .in('project_id', projectIds)
        .eq('assignee', user?.userName)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });
      
      if (taskError) throw taskError;
      
      // Format the tasks
      const formattedTasks = taskData.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        project_id: task.project_id,
        project_name: task.projects?.title || 'Unknown Project',
        status: task.status
      }));
      
      setTasks(formattedTasks);
    } catch (error: any) {
      console.error('Error fetching pending tasks:', error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("Task marked as complete");
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task");
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight">All Pending Tasks</h1>
        <p className="text-muted-foreground">
          View and manage all your pending tasks across all projects.
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card className="text-center p-6">
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">All caught up!</h3>
            <p className="text-muted-foreground max-w-sm">
              You don't have any pending tasks. Time to create some new goals!
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden animate-scale-in">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{task.title}</CardTitle>
                  {getPriorityBadge(task.priority)}
                </div>
                <CardDescription className="line-clamp-2">
                  {task.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {task.due_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="mt-2">
                  <Link to={`/projects/${task.project_id}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80">
                      {task.project_name}
                    </Badge>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Link to={`/projects/${task.project_id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Button 
                    size="sm"
                    onClick={() => markTaskComplete(task.id)}
                  >
                    Mark Complete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingTasks;
