
export interface Project {
  id: string;
  name: string;
  identifier: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface WorkPackage {
  id: string;
  subject: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  estimatedTime?: number;
  percentageDone: number;
  createdAt: string;
  updatedAt: string;
  status: {
    id: string;
    name: string;
    color: string;
  };
  type: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  priority: {
    id: string;
    name: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface BurndownData {
  dates: string[];
  ideal: number[];
  actual: number[];
  remaining: number[];
}

export interface WorkloadData {
  user: User;
  assignedTasks: number;
  estimatedHours: number;
  completedTasks: number;
}

export interface ApiCredentials {
  url: string;
  apiKey: string;
}
