
import { useEffect, useState } from "react";
import { openProjectAPI } from "@/lib/api";
import { User, WorkPackage } from "@/types/openproject";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TeamOverview } from "@/components/TeamOverview";

export default function TeamPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!openProjectAPI.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch projects first (to get the first project ID)
        const projects = await openProjectAPI.getProjects();
        if (projects.length === 0) {
          setError("No se encontraron proyectos en tu instancia de OpenProject.");
          return;
        }

        // Use the first project by default
        const projectId = projects[0].id;
        
        // Fetch project members
        const fetchedMembers = await openProjectAPI.getProjectMembers(projectId);
        setMembers(fetchedMembers);

        // Fetch work packages to calculate workload
        const fetchedWorkPackages = await openProjectAPI.getWorkPackages(projectId);
        setWorkPackages(fetchedWorkPackages);
      } catch (err) {
        console.error("Error fetching team data:", err);
        setError("Error al cargar los datos del equipo. Por favor, intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando datos del equipo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-project-800 mb-6">Gestión del equipo</h1>

      <TeamOverview members={members} workPackages={workPackages} />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por tipo de tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Gráfico de distribución de tipos de tarea
              <p className="text-xs mt-2">(Esta visualización utiliza datos simulados)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento semanal del equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Gráfico de rendimiento semanal
              <p className="text-xs mt-2">(Esta visualización utiliza datos simulados)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
