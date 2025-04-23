
import { useEffect, useState } from "react";
import { openProjectAPI } from "@/lib/api";
import { WorkPackage } from "@/types/openproject";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDateTasks, setSelectedDateTasks] = useState<WorkPackage[]>([]);

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
        
        // Fetch work packages
        const fetchedWorkPackages = await openProjectAPI.getWorkPackages(projectId);
        setWorkPackages(fetchedWorkPackages);
        
        // Initialize selected date tasks
        updateSelectedDateTasks(fetchedWorkPackages, new Date());
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Error al cargar los datos del calendario. Por favor, intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const updateSelectedDateTasks = (tasks: WorkPackage[], selectedDate: Date | undefined) => {
    if (!selectedDate) return setSelectedDateTasks([]);
    
    const selected = selectedDate.toDateString();
    const tasksForDate = tasks.filter(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toDateString();
        return dueDate === selected;
      }
      return false;
    });
    
    setSelectedDateTasks(tasksForDate);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    updateSelectedDateTasks(workPackages, newDate);
  };

  // Generate date classname based on tasks due on that date
  const getDayClassNames = (day: Date): string => {
    const dayString = day.toDateString();
    
    const hasTasks = workPackages.some(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toDateString();
        return dueDate === dayString;
      }
      return false;
    });
    
    if (hasTasks) {
      return "bg-project-100 rounded-full font-bold";
    }
    
    return "";
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando datos del calendario...</p>
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
      <h1 className="text-3xl font-bold text-project-800 mb-6">Calendario de proyecto</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fechas de entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="border rounded-md p-4"
              modifiersClassNames={{
                selected: "bg-project-600 text-white hover:bg-project-600 hover:text-white focus:bg-project-600 focus:text-white"
              }}
              modifiers={{
                booked: (date) => {
                  const dayString = date.toDateString();
                  return workPackages.some(task => {
                    if (task.dueDate) {
                      const dueDate = new Date(task.dueDate).toDateString();
                      return dueDate === dayString;
                    }
                    return false;
                  });
                }
              }}
              classNames={{
                day_today: "font-bold border border-project-400",
                day_selected: "bg-project-500 text-white"
              }}
              components={{
                DayContent: ({ date: dayDate }) => {
                  const dayClassName = getDayClassNames(dayDate);
                  
                  return (
                    <div className={`h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center ${dayClassName}`}>
                      {dayDate.getDate()}
                    </div>
                  );
                }
              }}
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Los días con entregas programadas están resaltados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Entregas para {date ? new Date(date).toLocaleDateString() : 'hoy'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              {selectedDateTasks.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="p-3 border rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{task.subject}</h4>
                        <Badge variant={
                          task.percentageDone === 100 ? "outline" :
                          task.percentageDone > 0 ? "secondary" : "default"
                        }>
                          {task.status.name}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-muted-foreground">
                          Asignado a: {task.assignedTo?.name || 'Sin asignar'}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-project-500" 
                              style={{ width: `${task.percentageDone}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{task.percentageDone}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-gray-500">No hay entregas programadas para este día</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
