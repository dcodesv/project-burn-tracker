
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { openProjectAPI } from "@/lib/api";
import { BurndownChart } from "@/components/BurndownChart";
import { WorkloadChart } from "@/components/WorkloadChart";
import { TaskList } from "@/components/TaskList";
import { DashboardSummary } from "@/components/DashboardSummary";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => openProjectAPI.getProject(projectId!),
    enabled: !!projectId,
  });

  const { data: workPackages, isLoading: isLoadingWorkPackages } = useQuery({
    queryKey: ['workPackages', projectId],
    queryFn: () => openProjectAPI.getWorkPackages(projectId!),
    enabled: !!projectId,
  });

  const { data: burndownData } = useQuery({
    queryKey: ['burndown', projectId],
    queryFn: () => openProjectAPI.getBurndownData(projectId!),
    enabled: !!projectId,
  });

  const { data: workloadData } = useQuery({
    queryKey: ['workload', projectId],
    queryFn: () => openProjectAPI.getWorkloadData(projectId!),
    enabled: !!projectId,
  });

  if (isLoadingProject || isLoadingWorkPackages) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
      </div>
    );
  }

  if (!project || !workPackages) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-destructive">Error</h2>
        <p className="mt-2 text-muted-foreground">Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="mt-2 text-muted-foreground">{project.description}</p>
      </div>

      <DashboardSummary project={project} workPackages={workPackages} />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {burndownData && <BurndownChart data={burndownData} />}
        {workloadData && workloadData.length > 0 && <WorkloadChart data={workloadData} />}
        <TaskList tasks={workPackages} />
      </div>
    </div>
  );
}
