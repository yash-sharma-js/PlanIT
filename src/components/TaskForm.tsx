
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import QrCodeScanner from "./QrCodeScanner";

interface TaskFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskForm = ({ projectId, onSuccess, onCancel }: TaskFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: undefined as Date | undefined,
    status: "to-do",
    priority: "medium"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, dueDate: date }));
  };

  const handleQrCodeScan = (data: string) => {
    // Assuming the QR code contains a username
    setFormData(prev => ({ ...prev, assignee: data }));
    toast.success(`User assigned: ${data}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title) {
      toast.error("Task title is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert task
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          assignee: formData.assignee,
          due_date: formData.dueDate?.toISOString(),
          status: formData.status,
          priority: formData.priority,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        project_id: projectId,
        user_name: user?.userName || 'Unknown user',
        action: 'added a new task: ' + formData.title
      });

      toast.success("Task created successfully");
      onSuccess();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Task Title <span className="text-destructive">*</span></Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Enter task title"
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
          placeholder="Enter task description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Assignee */}
      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <div className="flex gap-2">
          <Input 
            id="assignee" 
            name="assignee" 
            placeholder="Enter username"
            value={formData.assignee}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setShowQrScanner(true)}
            disabled={isSubmitting}
          >
            Scan QR
          </Button>
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label>Due Date</Label>
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
              onSelect={handleDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
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
              <SelectItem value="to-do">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
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

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
      </div>

      {/* QR Code Scanner */}
      <QrCodeScanner 
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScan={handleQrCodeScan}
      />
    </form>
  );
};

export default TaskForm;
