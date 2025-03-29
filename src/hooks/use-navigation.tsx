
import { useNavigate } from "react-router-dom";

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goToPendingTasks = () => {
    navigate("/pending-tasks");
  };

  const goToProjects = () => {
    navigate("/projects");
  };

  const goToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const goToMeetings = () => {
    navigate("/meetings");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return {
    goToPendingTasks,
    goToProjects,
    goToProject,
    goToMeetings,
    goToProfile
  };
};
