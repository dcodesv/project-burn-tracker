
import { Bell, Calendar, ChartLine, FileText, FolderKanban, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { icon: ChartLine, label: "Dashboard", path: "/" },
    { icon: FolderKanban, label: "Proyectos", path: "/projects" },
    { icon: FileText, label: "Tareas", path: "/tasks" },
    { icon: User, label: "Equipo", path: "/team" },
    { icon: Calendar, label: "Calendario", path: "/calendar" },
  ];
  
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full bg-white shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <ChartLine className="h-6 w-6 text-project-600" />
            <span className="text-lg font-bold text-project-800">OpenPro Tracker</span>
          </Link>
          
          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-project-600",
                      location.pathname === item.path ? "text-project-600" : "text-gray-600"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </button>
          
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
            <span className="text-xs font-medium uppercase">UN</span>
            <span className="sr-only">User profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
