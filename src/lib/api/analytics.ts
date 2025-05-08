
import { BurndownData, WorkloadData, WorkPackage } from '../../types/openproject';
import { OpenProjectClient } from './client';
import { MembersService } from './members';
import { WorkPackagesService } from './workPackages';

export class AnalyticsService extends OpenProjectClient {
  private membersService: MembersService;
  private workPackagesService: WorkPackagesService;

  constructor() {
    super();
    this.membersService = new MembersService();
    this.workPackagesService = new WorkPackagesService();
  }

  async getBurndownData(
    projectId: string,
    sprintId?: string
  ): Promise<BurndownData> {
    try {
      // Obtener los paquetes de trabajo del proyecto
      const workPackages = await this.workPackagesService.getWorkPackages(projectId);
      
      console.log("Work packages for burndown:", workPackages);
      
      // Filtrar por sprint si se proporciona ID de sprint
      let filteredWorkPackages = workPackages;
      if (sprintId) {
        filteredWorkPackages = workPackages.filter(wp => wp.version === sprintId);
      }
      
      // Determinar la fecha de inicio y fin para el burndown chart
      let startDate = new Date();
      let endDate = new Date();
      
      // Si hay paquetes de trabajo, usar sus fechas
      if (filteredWorkPackages.length > 0) {
        // Encontrar la primera fecha de inicio
        const allStartDates = filteredWorkPackages
          .filter(wp => wp.startDate)
          .map(wp => new Date(wp.startDate!));
          
        // Encontrar la última fecha de vencimiento
        const allDueDates = filteredWorkPackages
          .filter(wp => wp.dueDate)
          .map(wp => new Date(wp.dueDate!));
          
        if (allStartDates.length > 0) {
          startDate = new Date(Math.min(...allStartDates.map(d => d.getTime())));
        }
        
        if (allDueDates.length > 0) {
          endDate = new Date(Math.max(...allDueDates.map(d => d.getTime())));
        } else {
          // Si no hay fechas de vencimiento, usar 14 días desde la fecha de inicio
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 14);
        }
      } else {
        // Si no hay paquetes de trabajo, usar 14 días desde hoy
        endDate.setDate(endDate.getDate() + 14);
      }
      
      console.log("Burndown period:", startDate, "to", endDate);
      
      // Calcular el número de días entre la fecha de inicio y fin
      const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const numDays = Math.max(dayDiff, 7); // Al menos 7 días para el gráfico
      
      // Calcular el trabajo total (suma de tiempos estimados)
      let totalEstimatedHours = filteredWorkPackages.reduce((sum, wp) => {
        return sum + (wp.estimatedTime || 0);
      }, 0);
      
      // Si no hay horas estimadas, usar un valor por defecto basado en el número de tareas
      if (totalEstimatedHours === 0) {
        totalEstimatedHours = filteredWorkPackages.length * 8; // 8 horas por tarea
      }
      
      console.log("Total estimated hours:", totalEstimatedHours);
      
      const dates = [];
      const ideal = [];
      const actual = [];
      const remaining = [];
      
      const idealPerDay = totalEstimatedHours / numDays;
      
      // Generar los datos para cada día
      for (let i = 0; i < numDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];
        dates.push(dateStr);
        
        // La línea ideal es una línea recta descendente
        ideal.push(Math.max(0, totalEstimatedHours - idealPerDay * i));
        
        // Calcular el progreso real hasta la fecha actual
        let completedHours = 0;
        let remainingHours = totalEstimatedHours;
        
        if (currentDate <= new Date()) {
          // Para fechas pasadas o la fecha actual, calcular trabajo completado
          completedHours = filteredWorkPackages.reduce((sum, wp) => {
            const wpDate = wp.updatedAt ? new Date(wp.updatedAt) : null;
            // Solo contar trabajo completado hasta la fecha actual
            if (wpDate && wpDate <= currentDate) {
              return sum + ((wp.estimatedTime || 0) * (wp.percentageDone / 100));
            }
            return sum;
          }, 0);
          
          remainingHours = Math.max(0, totalEstimatedHours - completedHours);
        }
        
        actual.push(totalEstimatedHours - completedHours);
        remaining.push(remainingHours);
      }
      
      return { dates, ideal, actual, remaining };
    } catch (error) {
      console.error("Error getting burndown data:", error);
      // Devolver datos simulados como fallback si ocurre un error
      return this.getSimulatedBurndownData();
    }
  }
  
  // Método de respaldo que devuelve datos simulados
  private getSimulatedBurndownData(): BurndownData {
    const today = new Date();
    const dates = [];
    const ideal = [];
    const actual = [];
    const remaining = [];

    // Generate 14 days of data
    const totalPoints = 100;
    const idealPerDay = totalPoints / 14;

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - 13 + i);
      dates.push(date.toISOString().split("T")[0]);

      // Ideal burndown is a straight line
      ideal.push(Math.max(0, totalPoints - idealPerDay * i));

      // Actual burndown with some variation
      if (i < 7) {
        // Less progress in first half
        actual.push(Math.max(0, totalPoints - idealPerDay * i * 0.8));
      } else {
        // More progress in second half
        actual.push(Math.max(0, totalPoints - idealPerDay * i * 1.1));
      }

      // Remaining work based on actual
      remaining.push(actual[i]);
    }

    return { dates, ideal, actual, remaining };
  }

  async getWorkloadData(projectId: string): Promise<WorkloadData[]> {
    const members = await this.membersService.getProjectMembers(projectId);
    const workPackages = await this.workPackagesService.getWorkPackages(projectId);
    
    console.log("Members : API", members);
    console.log("Work Packages : API", workPackages);
    
    return members.map(user => {
      const userTasks = workPackages.filter(wp => wp.assignedTo?.id === user.id);
      const completedTasks = userTasks.filter(wp => wp.percentageDone === 100).length;
      const estimatedHours = userTasks.reduce((sum, wp) => sum + (wp.estimatedTime || 0), 0);
      
      return {
        user,
        assignedTasks: userTasks.length,
        estimatedHours,
        completedTasks,
      };
    });
  }
}
