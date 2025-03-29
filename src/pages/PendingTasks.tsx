
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

// Mock data for tasks
const MOCK_TASKS = [
  {
    id: "task1",
    title: "Design Homepage Wireframes",
    description: "Create wireframes for the new homepage layout",
    dueDate: "2023-12-20",
    priority: "high",
    projectId: "project1",
    projectName: "Website Redesign",
    status: "pending"
  },
  {
    id: "task2",
    title: "Database Schema Review",
    description: "Review and optimize the current database schema",
    dueDate: "2023-12-25",
    priority: "medium",
    projectId: "project2",
    projectName: "Backend Optimization",
    status: "pending"
  },
  {
    id: "task3",
    title: "User Testing Session",
    description: "Conduct user testing session with 5 participants",
    dueDate: "2023-12-23",
    priority: "medium",
    projectId: "project1",
    projectName: "Website Redesign",
    status: "pending"
  },
  {
    id: "task4",
    title: "API Documentation Update",
    description: "Update API documentation with new endpoints",
    dueDate: "2023-12-27",
    priority: "low",
    projectId: "project2",
    projectName: "Backend Optimization",
    status: "pending"
  },
  {
    id: "task5",
    title: "Create Marketing Assets",
    description: "Design social media graphics and banners",
    dueDate: "2023-12-21",
    priority: "high",
    projectId: "project3",
    projectName: "Product Launch",
    status: "pending"
  }
];

const PendingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with delay
    const timer = setTimeout(() => {
      setTasks(MOCK_TASKS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{task.title}</CardTitle>
                  {getPriorityBadge(task.priority)}
                </div>
                <CardDescription className="line-clamp-2">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="mt-2">
                  <Link to={`/projects/${task.projectId}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80">
                      {task.projectName}
                    </Badge>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                  <Button size="sm">
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
