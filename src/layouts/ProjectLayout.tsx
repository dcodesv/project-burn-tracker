
import { useParams, Outlet, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { openProjectAPI } from "@/lib/api";
import { FileText, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => openProjectAPI.getProject(projectId!),
    enabled: !!projectId,
  });
  
  const navItems = [
    { path: `/projects/${projectId}`, label: "Resumen", exact: true },
    { path: `/projects/${projectId}/tasks`, label: "Tareas", icon: FileText },
    { path: `/projects/${projectId}/team`, label: "Equipo", icon: Users },
  ];
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link 
          to="/projects" 
          className="text-sm flex items-center gap-1 text-muted-foreground hover:text-project-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Proyectos
        </Link>
        
        <h1 className="text-3xl font-bold text-project-800">{project?.name || "Proyecto"}</h1>
      </div>
      
      <Card className="mb-6">
        <div className="border-b">
          <div className="flex flex-wrap -mb-px">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2",
                    isActive 
                      ? "border-project-600 text-project-600" 
                      : "border-transparent text-muted-foreground hover:text-project-600 hover:border-project-300"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </Card>
      
      <Outlet />
    </div>
  );
}
