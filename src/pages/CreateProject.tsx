import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar,
  Plus,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    status: "planning",
    priority: "medium",
    assignedUsers: [] as string[]
  });
  const [newUserName, setNewUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.userName) {
      setFormData(prev => ({
        ...prev,
        assignedUsers: [user.userName]
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (formData.assignedUsers.includes(newUserName.trim())) {
      toast.error("This user is already assigned");
      return;
    }

    setFormData(prev => ({
      ...prev,
      assignedUsers: [...prev.assignedUsers, newUserName.trim()]
    }));
    setNewUserName("");
  };

  const handleRemoveUser = (userName: string) => {
    if (user?.userName === userName) {
      toast.error("You cannot remove yourself from the project");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter(u => u !== userName)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error("Project title is required");
      return;
    }
    
    if (!formData.startDate || !formData.dueDate) {
      toast.error("Both start and due dates are required");
      return;
    }
    
    if (formData.startDate > formData.dueDate) {
      toast.error("Due date must be after start date");
      return;
    }
    
    if (formData.assignedUsers.length === 0) {
      toast.error("At least one user must be assigned to the project");
      return;
    }
    
    fetch('http://localhost:8080/project/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        userId: user?.id
      }),
    }).catch(error => {
      console.error('Error calling project create API:', error);
    });
    
    setIsSubmitting(true);
    
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate?.toISOString(),
          due_date: formData.dueDate?.toISOString(),
          status: formData.status,
          priority: formData.priority,
          progress: 0,
          created_by: user?.id
        })
        .select()
        .single();

      if (projectError) {
        throw projectError;
      }

      const teamMembers = formData.assignedUsers.map(userName => ({
        project_id: project.id,
        user_name: userName,
        role: userName === user?.userName ? 'Project Manager' : 'Team Member'
      }));

      const { error: teamError } = await supabase
        .from('team_members')
        .insert(teamMembers);

      if (teamError) {
        throw teamError;
      }

      await supabase.from('activity_logs').insert({
        project_id: project.id,
        user_name: user?.userName || 'Unknown user',
        action: 'created the project'
      });

      toast.success("Project created successfully");
      navigate(`/projects/${project.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit gap-1" 
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground max-w-xl">
          Fill in the details below to create a new project. You can add team members and tasks after the project is created.
        </p>
      </div>

      <Card className="glass-panel animate-scale-in max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information about your new project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="Enter project title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Enter project description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !formData.startDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP")
                      ) : (
                        <span>Select start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => handleDateChange("startDate", date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.dueDate ? (
                        format(formData.dueDate, "PPP")
                      ) : (
                        <span>Select due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => handleDateChange("dueDate", date)}
                      initialFocus
                      disabled={(date) => 
                        formData.startDate ? date < formData.startDate : false
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleSelectChange("priority", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Assign Users <span className="text-destructive">*</span></Label>
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span className="font-medium text-sm">Team Members</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {formData.assignedUsers.map((userName) => (
                    <div key={userName} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                      <span className="text-sm font-medium">
                        @{userName}
                        {user?.userName === userName && (
                          <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                        )}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveUser(userName)}
                        disabled={user?.userName === userName || isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter username"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddUser}
                    disabled={isSubmitting}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => navigate("/projects")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateProject;
