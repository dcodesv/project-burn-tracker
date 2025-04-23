
import { useEffect, useState } from "react";
import { openProjectAPI } from "@/lib/api";
import { WorkPackage } from "@/types/openproject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function TasksPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [filteredWorkPackages, setFilteredWorkPackages] = useState<WorkPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!openProjectAPI.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchWorkPackages = async () => {
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
        
        // Fetch work packages for the selected project
        const fetchedWorkPackages = await openProjectAPI.getWorkPackages(projectId);
        setWorkPackages(fetchedWorkPackages);
        setFilteredWorkPackages(fetchedWorkPackages);
      } catch (err) {
        console.error("Error fetching work packages:", err);
        setError("Error al cargar las tareas. Por favor, intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkPackages();
  }, [navigate]);

  useEffect(() => {
    // Apply filters whenever the filter criteria change
    let filtered = workPackages;

    if (searchTerm) {
      filtered = filtered.filter(wp => 
        wp.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        wp.id.includes(searchTerm)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(wp => wp.status.name === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(wp => wp.type.name === typeFilter);
    }

    setFilteredWorkPackages(filtered);
  }, [searchTerm, statusFilter, typeFilter, workPackages]);

  // Extract unique status and type values for filters
  const uniqueStatuses = Array.from(new Set(workPackages.map(wp => wp.status.name)));
  const uniqueTypes = Array.from(new Set(workPackages.map(wp => wp.type.name)));

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-project-600 border-r-transparent border-b-project-300 border-l-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando tareas...</p>
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
      <h1 className="text-3xl font-bold text-project-800 mb-6">Tareas del proyecto</h1>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Lista de tareas</CardTitle>
          <CardDescription>
            {filteredWorkPackages.length} tareas encontradas
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 self-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Estado
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  {uniqueStatuses.map((status) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? "bg-accent" : ""}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Tipo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTypeFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  {uniqueTypes.map((type) => (
                    <DropdownMenuItem 
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={typeFilter === type ? "bg-accent" : ""}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Asignado a</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Progreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkPackages.length > 0 ? (
                  filteredWorkPackages.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.subject}</TableCell>
                      <TableCell>
                        <Badge variant={
                          task.percentageDone === 100 ? "outline" :
                          task.percentageDone > 0 ? "secondary" : "default"
                        }>
                          {task.status.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          task.type.name.toLowerCase().includes('bug') ? "destructive" : 
                          task.type.name.toLowerCase().includes('feature') ? "default" : "outline"
                        }>
                          {task.type.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin fecha</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={task.percentageDone} className="h-2 w-[60px]" />
                          <span className="text-xs text-muted-foreground">{task.percentageDone}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No se encontraron tareas con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
