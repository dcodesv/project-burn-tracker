
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TasksPage from "./pages/TasksPage";
import TeamPage from "./pages/TeamPage";
import WorkloadPage from "./pages/WorkloadPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import MainLayout from "./layouts/MainLayout";
import ProjectLayout from "./layouts/ProjectLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="workload" element={<WorkloadPage />} />
              
              {/* Rutas anidadas para proyectos */}
              <Route path="projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<ProjectDetailPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="team" element={<TeamPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
