
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute top-0 left-0 w-full h-full rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-[25%] left-[25%] w-[50%] h-[50%] rounded-full bg-primary/20 animate-pulse" style={{ animationDuration: '2s' }}></div>
          <p className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-6xl font-bold text-primary">
            404
          </p>
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate(user ? "/" : "/login")} 
            className="w-full sm:w-auto"
          >
            {user ? "Go to Dashboard" : "Go to Login"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
