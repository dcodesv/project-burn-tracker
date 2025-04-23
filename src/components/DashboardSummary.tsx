
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project, WorkPackage } from "@/types/openproject";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface DashboardSummaryProps {
  project: Project;
  workPackages: WorkPackage[];
}

export function DashboardSummary({ project, workPackages }: DashboardSummaryProps) {
  // Calculate summary data
  const totalTasks = workPackages.length;
  const completedTasks = workPackages.filter(wp => wp.percentageDone === 100).length;
  const inProgressTasks = workPackages.filter(wp => wp.percentageDone > 0 && wp.percentageDone < 100).length;
  const notStartedTasks = workPackages.filter(wp => wp.percentageDone === 0).length;
  
  const projectProgress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  const overdueWorkPackages = workPackages.filter(wp => {
    if (!wp.dueDate) return false;
    const dueDate = new Date(wp.dueDate);
    const today = new Date();
    return dueDate < today && wp.percentageDone < 100;
  });

  // Find the upcoming milestone (if any)
  const milestones = workPackages
    .filter(wp => wp.type.name.toLowerCase().includes('milestone'))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  
  const nextMilestone = milestones.find(m => {
    if (!m.dueDate) return false;
    const dueDate = new Date(m.dueDate);
    const today = new Date();
    return dueDate >= today;
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Progreso total</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectProgress}%</div>
            <Progress className="h-2 mt-2" value={projectProgress} />
            <p className="text-xs text-muted-foreground mt-2">
              {completedTasks} de {totalTasks} tareas completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Estado actual</CardTitle>
            <Clock className="h-4 w-4 text-project-600" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-success">{completedTasks}</div>
                <p className="text-xs">Completadas</p>
              </div>
              <div>
                <div className="text-xl font-bold text-project-600">{inProgressTasks}</div>
                <p className="text-xs">En progreso</p>
              </div>
              <div>
                <div className="text-xl font-bold text-muted-foreground">{notStartedTasks}</div>
                <p className="text-xs">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Próximo hito</CardTitle>
            <Calendar className="h-4 w-4 text-project-600" />
          </CardHeader>
          <CardContent>
            {nextMilestone ? (
              <>
                <div className="text-sm font-medium truncate">{nextMilestone.subject}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {nextMilestone.dueDate ? new Date(nextMilestone.dueDate).toLocaleDateString() : 'Sin fecha'}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hay hitos programados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tareas atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueWorkPackages.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {overdueWorkPackages.length > 0
                ? 'Requieren atención inmediata'
                : 'No hay tareas atrasadas'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
