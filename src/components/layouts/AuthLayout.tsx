
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const AuthLayout = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">TaskSphere</h1>
            <p className="text-muted-foreground">Manage projects with elegance</p>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
