
import { ApiCredentials } from '../../types/openproject';

export class OpenProjectClient {
  private credentials: ApiCredentials | null = {
    url: 'https://openproject.org',
    apiKey: 'b020d400703401a2746a40e959b97672170c1e37d4c92cbb3fdbd8d97b205161'
  };

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
    
    return this.credentials;
  }

  clearCredentials() {
    this.credentials = {
      url: 'https://openproject.org',
      apiKey: 'b020d400703401a2746a40e959b97672170c1e37d4c92cbb3fdbd8d97b205161'
    };
    localStorage.removeItem('openproject_credentials');
  }

  isAuthenticated(): boolean {
    return true; // Siempre retornamos true ya que tenemos credenciales por defecto
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
