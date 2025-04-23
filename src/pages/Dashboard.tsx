
import { useEffect, useState } from "react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { BurndownChart } from "@/components/BurndownChart";
import { WorkloadChart } from "@/components/WorkloadChart";
import { TaskList } from "@/components/TaskList";
import { Project, WorkPackage, BurndownData, WorkloadData } from "@/types/openproject";
import { openProjectAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [burndownData, setBurndownData] = useState<BurndownData | null>(null);
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);

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

        // Fetch projects
        const fetchedProjects = await openProjectAPI.getProjects();
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
          // Use the first project by default
          const selectedProject = fetchedProjects[0];
          setCurrentProject(selectedProject);

          // Fetch work packages for the selected project
          const workPackages = await openProjectAPI.getWorkPackages(selectedProject.id);
          setWorkPackages(workPackages);

          // Fetch burndown data
          const burndownData = await openProjectAPI.getBurndownData(selectedProject.id);
          setBurndownData(burndownData);

          // Fetch workload data
          const workloadData = await openProjectAPI.getWorkloadData(selectedProject.id);
          setWorkloadData(workloadData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error al cargar los datos del proyecto. Por favor, intenta nuevamente.");
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
            <p className="text-sm text-muted-foreground">Cargando datos del proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-destructive">Error</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-project-600 px-4 py-2 text-white hover:bg-project-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold">No hay proyectos</h2>
            <p className="mt-2 text-muted-foreground">
              No se encontraron proyectos en tu instancia de OpenProject.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-project-800">{currentProject.name}</h1>
        {currentProject.description && (
          <p className="mt-2 text-muted-foreground">{currentProject.description}</p>
        )}
      </div>

      {/* Dashboard Summary */}
      <DashboardSummary project={currentProject} workPackages={workPackages} />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Burndown Chart */}
        {burndownData && <BurndownChart data={burndownData} />}

        {/* Workload Chart */}
        {workloadData.length > 0 && <WorkloadChart data={workloadData} />}

        {/* Task List */}
        <TaskList tasks={workPackages} />
      </div>
    </div>
  );
}
