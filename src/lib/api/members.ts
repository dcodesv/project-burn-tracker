
import { User } from '../../types/openproject';
import { OpenProjectClient } from './client';

export class MembersService extends OpenProjectClient {
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
}

