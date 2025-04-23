
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WorkPackage } from "@/types/openproject";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
  tasks: WorkPackage[];
}

type SortField = 'dueDate' | 'priority' | 'status';
type FilterStatus = 'all' | 'completed' | 'in-progress' | 'not-started';

export function TaskList({ tasks }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return task.percentageDone === 100;
    if (filterStatus === 'in-progress') return task.percentageDone > 0 && task.percentageDone < 100;
    if (filterStatus === 'not-started') return task.percentageDone === 0;
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    if (sortField === 'priority') {
      // Higher priority would usually have a lower ID in most systems
      return parseInt(a.priority.id) - parseInt(b.priority.id);
    }
    
    if (sortField === 'status') {
      return a.status.name.localeCompare(b.status.name);
    }
    
    return 0;
  });

  return (
    <Card className="col-span-3 h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Listado de tareas</CardTitle>
            <CardDescription>
              {filteredTasks.length} tareas encontradas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="not-started">No iniciadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                if (sortField === 'dueDate') setSortField('priority');
                else if (sortField === 'priority') setSortField('status');
                else setSortField('dueDate');
              }}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ordenar por {
                sortField === 'dueDate' ? 'fecha' :
                sortField === 'priority' ? 'prioridad' : 'estado'
              }</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.subject}</h3>
                      <Badge variant={
                        task.percentageDone === 100 ? "outline" :
                        task.percentageDone > 0 ? "secondary" : "default"
                      }>
                        {task.status.name}
                      </Badge>
                      <Badge variant={
                        task.type.name.toLowerCase().includes('bug') ? "destructive" : 
                        task.type.name.toLowerCase().includes('feature') ? "default" : "outline"
                      }>
                        {task.type.name}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 border-project-200 bg-project-50">
                    #
                    {task.id}
                  </Badge>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1 text-gray-500">
                        <User className="h-3.5 w-3.5" />
                        <span>{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="h-3.5 w-3.5" />
                        <span>Sin asignar</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {task.percentageDone}%
                    </span>
                    <Progress
                      value={task.percentageDone}
                      className="h-1.5 w-20"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {sortedTasks.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-gray-500">No se encontraron tareas que coincidan con el filtro</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
