
import { OpenProjectClient } from './client';
import { ProjectsService } from './projects';
import { WorkPackagesService } from './workPackages';
import { MembersService } from './members';
import { AnalyticsService } from './analytics';

class OpenProjectAPI extends OpenProjectClient {
  private projectsService: ProjectsService;
  private workPackagesService: WorkPackagesService;
  private membersService: MembersService;
  private analyticsService: AnalyticsService;

  constructor() {
    super();
    this.projectsService = new ProjectsService();
    this.workPackagesService = new WorkPackagesService();
    this.membersService = new MembersService();
    this.analyticsService = new AnalyticsService();
  }

  // Delegate methods to their respective services
  getProjects = () => this.projectsService.getProjects();
  getProject = (projectId: string) => this.projectsService.getProject(projectId);
  getWorkPackages = (projectId: string) => this.workPackagesService.getWorkPackages(projectId);
  getProjectMembers = (projectId: string) => this.membersService.getProjectMembers(projectId);
  getBurndownData = (projectId: string) => this.analyticsService.getBurndownData(projectId);
  getWorkloadData = (projectId: string) => this.analyticsService.getWorkloadData(projectId);
}

export const openProjectAPI = new OpenProjectAPI();

