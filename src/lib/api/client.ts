
import { ApiCredentials } from '../../types/openproject';

export class OpenProjectClient {
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

  protected async request(endpoint: string, options: RequestInit = {}) {
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
}

