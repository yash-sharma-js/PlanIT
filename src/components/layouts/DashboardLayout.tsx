
import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  LayoutDashboard, 
  Folders, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <Folders className="w-5 h-5" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-30 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mr-2"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-bold">TaskSphere</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {location.pathname === "/projects" && (
            <Button size="sm" onClick={() => navigate("/projects/new")}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user?.avatar} alt={user?.name || ""} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> 
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-sidebar fixed h-full">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-xl text-sidebar-foreground">TaskSphere</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-md transition-all ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
          </div>
          
          {user && (
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 truncate">
                <p className="font-medium text-sidebar-foreground">{user.name}</p>
                <p className="text-sm text-sidebar-foreground/70 truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1 text-sidebar-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm">
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border animate-slide-in">
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-md transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 h-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
