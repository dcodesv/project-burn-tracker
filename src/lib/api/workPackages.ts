
import { WorkPackage } from '../../types/openproject';
import { OpenProjectClient } from './client';

export class WorkPackagesService extends OpenProjectClient {
  async getWorkPackages(projectId: string): Promise<WorkPackage[]> {
    const response = await this.request(`projects/${projectId}/work_packages`);
    return response._embedded.elements.map((wp: any) => ({
      id: wp.id,
      subject: wp.subject,
      description: wp.description?.raw || '',
      startDate: wp.startDate,
      dueDate: wp.dueDate,
      estimatedTime: wp.estimatedTime,
      percentageDone: wp.percentageDone || 0,
      createdAt: wp.createdAt,
      updatedAt: wp.updatedAt,
      status: {
        id: wp._links.status.href.split('/').pop() || '',
        name: wp._links.status.title || 'Unknown',
        color: '#cccccc', // Default color, would need another call to get actual color
      },
      type: {
        id: wp._links.type.href.split('/').pop() || '',
        name: wp._links.type.title || 'Unknown',
      },
      assignedTo: wp._links.assignee ? {
        id: wp._links.assignee.href.split('/').pop() || '',
        name: wp._links.assignee.title || 'Unassigned',
      } : undefined,
      project: {
        id: wp._links.project.href.split('/').pop() || '',
        name: wp._links.project.title || 'Unknown',
      },
      priority: {
        id: wp._links.priority.href.split('/').pop() || '',
        name: wp._links.priority.title || 'Normal',
      }
    }));
  }
}

