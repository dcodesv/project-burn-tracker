
import { BurndownData, WorkloadData } from '../../types/openproject';
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
    // In a real implementation, this would fetch and process work package history
    // For now, we'll return sample data

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
