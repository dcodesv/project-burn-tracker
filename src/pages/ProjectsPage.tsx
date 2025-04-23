
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CirclePercent } from "lucide-react";
import { openProjectAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => openProjectAPI.getProjects(),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error</h2>
          <p className="mt-2 text-muted-foreground">Error al cargar los proyectos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-project-800 mb-6">Proyectos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card 
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-project-700">{project.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {project.identifier}
                  </CardDescription>
                </div>
                <div className="relative shrink-0">
                  <CirclePercent 
                    className="h-12 w-12 text-project-600"
                    style={{
                      '--progress': `${project.percentComplete || 0}%`,
                    } as React.CSSProperties}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {project.percentComplete || 0}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description || "Sin descripción"}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-project-100 text-project-700">
                  {project.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  Actualizado: {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
