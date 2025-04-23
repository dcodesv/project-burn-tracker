
import { Project } from '../../types/openproject';
import { OpenProjectClient } from './client';

export class ProjectsService extends OpenProjectClient {
  async getProjects(): Promise<Project[]> {
    const response = await this.request('projects');
    return response._embedded.elements.map((project: any) => ({
      id: project.id,
      name: project.name,
      identifier: project.identifier,
      description: project.description?.raw || '',
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      status: project.status?.name || 'Active',
      percentComplete: Math.floor(Math.random() * 100), // Simulating completion percentage
    }));
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await this.request(`projects/${projectId}`);
    return {
      id: response.id,
      name: response.name,
      identifier: response.identifier,
      description: response.description?.raw || '',
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      status: response.status?.name || 'Active',
      percentComplete: Math.floor(Math.random() * 100), // Simulating completion percentage
    };
  }
}

