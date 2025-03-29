
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface TeamMemberFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TeamMemberForm = ({ projectId, onSuccess, onCancel }: TeamMemberFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  const [formData, setFormData] = useState({
    userName: "",
    role: "Team Member"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleQrCodeScan = (data: string) => {
    // Assuming the QR code contains a username
    setFormData(prev => ({ ...prev, userName: data }));
    toast.success(`User found: ${data}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.userName) {
      toast.error("Username is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if member already exists
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_name', formData.userName)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingMember) {
        toast.error("This user is already a team member");
        setIsSubmitting(false);
        return;
      }

      // Insert team member
      const { data: member, error } = await supabase
        .from('team_members')
        .insert({
          project_id: projectId,
          user_name: formData.userName,
          role: formData.role
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        project_id: projectId,
        user_name: user?.userName || 'Unknown user',
        action: `added ${formData.userName} as a ${formData.role}`
      });

      toast.success("Team member added successfully");
      onSuccess();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="userName">Username <span className="text-destructive">*</span></Label>
        <div className="flex gap-2">
          <Input 
            id="userName" 
            name="userName" 
            placeholder="Enter username"
            value={formData.userName}
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

      {/* Role */}
      <div className="space-y-2">
        <Label>Role</Label>
        <Select 
          value={formData.role} 
          onValueChange={handleRoleChange}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Project Manager">Project Manager</SelectItem>
            <SelectItem value="Team Lead">Team Lead</SelectItem>
            <SelectItem value="Team Member">Team Member</SelectItem>
            <SelectItem value="Observer">Observer</SelectItem>
          </SelectContent>
        </Select>
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
          {isSubmitting ? 'Adding...' : 'Add Member'}
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

export default TeamMemberForm;
