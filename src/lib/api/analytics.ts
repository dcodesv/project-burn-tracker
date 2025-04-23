
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

  async getBurndownData(projectId: string): Promise<BurndownData> {
    const today = new Date();
    const dates = [];
    const ideal = [];
    const actual = [];
    const remaining = [];
    
    // Generate 14 days of data
    let totalPoints = 100;
    const idealPerDay = totalPoints / 14;
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - 13 + i);
      dates.push(date.toISOString().split('T')[0]);
      
      ideal.push(Math.max(0, totalPoints - (idealPerDay * i)));
      
      if (i < 7) {
        actual.push(Math.max(0, totalPoints - (idealPerDay * i * 0.8)));
      } else {
        actual.push(Math.max(0, totalPoints - (idealPerDay * i * 1.1)));
      }
      
      remaining.push(actual[i]);
    }
    
    return { dates, ideal, actual, remaining };
  }

  async getWorkloadData(projectId: string): Promise<WorkloadData[]> {
    const members = await this.membersService.getProjectMembers(projectId);
    const workPackages = await this.workPackagesService.getWorkPackages(projectId);
    
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

