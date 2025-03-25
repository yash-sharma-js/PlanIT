
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar,
  Plus 
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

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    status: "planning",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
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
    
    // Submit form
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Project created successfully");
      setIsSubmitting(false);
      navigate("/projects");
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col space-y-3 mb-8">
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

      {/* Project Form */}
      <Card className="glass-panel animate-scale-in max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information about your new project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
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

            {/* Description */}
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

            {/* Dates */}
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

            {/* Status and Priority */}
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
