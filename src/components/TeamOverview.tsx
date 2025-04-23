
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, WorkPackage } from "@/types/openproject";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TeamOverviewProps {
  members: User[];
  workPackages: WorkPackage[];
}

export function TeamOverview({ members, workPackages }: TeamOverviewProps) {
  // Calculate stats for each team member
  const teamStats = members.map(member => {
    const assignedTasks = workPackages.filter(wp => wp.assignedTo?.id === member.id);
    const completedTasks = assignedTasks.filter(wp => wp.percentageDone === 100);
    const inProgressTasks = assignedTasks.filter(wp => wp.percentageDone > 0 && wp.percentageDone < 100);
    const notStartedTasks = assignedTasks.filter(wp => wp.percentageDone === 0);
    
    const totalEstimatedHours = assignedTasks.reduce((sum, wp) => sum + (wp.estimatedTime || 0), 0);
    const completedEstimatedHours = completedTasks.reduce((sum, wp) => sum + (wp.estimatedTime || 0), 0);
    
    // Calculate completion percentage
    const completionPercent = totalEstimatedHours > 0
      ? Math.round((completedEstimatedHours / totalEstimatedHours) * 100)
      : 0;
    
    return {
      member,
      assignedTasksCount: assignedTasks.length,
      completedTasksCount: completedTasks.length,
      inProgressTasksCount: inProgressTasks.length,
      notStartedTasksCount: notStartedTasks.length,
      totalEstimatedHours,
      completedEstimatedHours,
      completionPercent
    };
  });

  return (
    <Card className="col-span-3 h-[500px]">
      <CardHeader>
        <CardTitle>Visión general del equipo</CardTitle>
        <CardDescription>Distribución de trabajo entre miembros</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {teamStats.map((stat) => (
              <div key={stat.member.id} className="space-y-2">
                <div className="flex items-center gap-4">
                  <Avatar>
                    {stat.member.avatar ? (
                      <AvatarImage src={stat.member.avatar} alt={stat.member.name} />
                    ) : null}
                    <AvatarFallback>
                      {stat.member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{stat.member.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {stat.assignedTasksCount} tareas
                        </Badge>
                        <Badge variant="outline" className="bg-green-50">
                          {stat.totalEstimatedHours.toFixed(1)} horas
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={stat.completionPercent} className="flex-1" />
                      <span className="text-xs text-gray-500">{stat.completionPercent}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-12 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded border border-green-100 bg-green-50 p-2 text-center">
                    <span className="text-lg font-medium text-green-700">{stat.completedTasksCount}</span>
                    <p className="text-xs text-green-600">Completadas</p>
                  </div>
                  <div className="rounded border border-blue-100 bg-blue-50 p-2 text-center">
                    <span className="text-lg font-medium text-blue-700">{stat.inProgressTasksCount}</span>
                    <p className="text-xs text-blue-600">En progreso</p>
                  </div>
                  <div className="rounded border border-gray-100 bg-gray-50 p-2 text-center">
                    <span className="text-lg font-medium text-gray-700">{stat.notStartedTasksCount}</span>
                    <p className="text-xs text-gray-600">Pendientes</p>
                  </div>
                </div>
              </div>
            ))}
            
            {teamStats.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-gray-500">No hay miembros en el equipo</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
