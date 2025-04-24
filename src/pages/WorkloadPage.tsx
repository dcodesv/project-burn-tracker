
import { useEffect, useState } from "react";
import { openProjectAPI } from "@/lib/api";
import { User, WorkloadData } from "@/types/openproject";
import { WorkloadChart } from "@/components/WorkloadChart";
import { TeamOverview } from "@/components/TeamOverview";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function WorkloadPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  
  useEffect(() => {
    if (!openProjectAPI.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch projects first to get the first project ID
        const projects = await openProjectAPI.getProjects();
        if (projects.length === 0) {
          setError("No se encontraron proyectos en tu instancia de OpenProject.");
          return;
        }

        // Use the first project by default
        const projectId = projects[0].id;
        
        // Fetch workload data for the project
        const data = await openProjectAPI.getWorkloadData(projectId);
        setWorkloadData(data);
      } catch (err) {
        console.error("Error fetching workload data:", err);
        setError("Error al cargar los datos de carga de trabajo. Por favor, intenta nuevamente.");
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
            <p className="text-sm text-muted-foreground">Cargando datos de carga de trabajo...</p>
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
      <h1 className="text-3xl font-bold text-project-800 mb-6">
        Distribución de carga de trabajo
      </h1>

      <div className="grid gap-6">
        <WorkloadChart data={workloadData} />
        <TeamOverview members={workloadData.map(d => d.user)} workPackages={[]} />
      </div>
    </div>
  );
}
