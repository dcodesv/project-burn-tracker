
import { ApiCredentials, Project, WorkPackage, User, BurndownData, WorkloadData } from '../types/openproject';

class OpenProjectAPI {
  private credentials: ApiCredentials | null = null;

  setCredentials(credentials: ApiCredentials) {
    this.credentials = credentials;
    localStorage.setItem('openproject_credentials', JSON.stringify(credentials));
  }
  
  getCredentials(): ApiCredentials | null {
    if (this.credentials) return this.credentials;
    
    const savedCredentials = localStorage.getItem('openproject_credentials');
    if (savedCredentials) {
      this.credentials = JSON.parse(savedCredentials);
      return this.credentials;
    }
    
    return null;
  }

  clearCredentials() {
    this.credentials = null;
    localStorage.removeItem('openproject_credentials');
  }

  isAuthenticated(): boolean {
    return !!this.getCredentials();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const credentials = this.getCredentials();
    
    if (!credentials) {
      throw new Error('API credentials not set');
    }
    
    const url = `${credentials.url}/api/v3/${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.apiKey}`,
      ...options.headers,
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

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

  async getProjectMembers(projectId: string): Promise<User[]> {
    const response = await this.request(`projects/${projectId}/memberships`);
    const members: User[] = [];
    
    for (const membership of response._embedded.elements) {
      if (membership._links.principal.type === 'User') {
        const userId = membership._links.principal.href.split('/').pop();
        const userResponse = await this.request(`users/${userId}`);
        
        members.push({
          id: userResponse.id,
          name: userResponse.name,
          email: userResponse.email || '',
          avatar: userResponse._links.avatar?.href || '',
        });
      }
    }
    
    return members;
  }

  // Simulated functions for data that would require multiple API calls or calculations
  async getBurndownData(projectId: string, sprintId?: string): Promise<BurndownData> {
    // In a real implementation, this would fetch and process work package history
    // For now, we'll return sample data
    
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
      
      // Ideal burndown is a straight line
      ideal.push(Math.max(0, totalPoints - (idealPerDay * i)));
      
      // Actual burndown with some variation
      if (i < 7) {
        // Less progress in first half
        actual.push(Math.max(0, totalPoints - (idealPerDay * i * 0.8)));
      } else {
        // More progress in second half
        actual.push(Math.max(0, totalPoints - (idealPerDay * i * 1.1)));
      }
      
      // Remaining work based on actual
      remaining.push(actual[i]);
    }
    
    return { dates, ideal, actual, remaining };
  }

  async getWorkloadData(projectId: string): Promise<WorkloadData[]> {
    // In a real implementation, this would calculate workload from work packages
    // For now, we'll return sample data
    
    const members = await this.getProjectMembers(projectId);
    const workPackages = await this.getWorkPackages(projectId);
    
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

export const openProjectAPI = new OpenProjectAPI();
