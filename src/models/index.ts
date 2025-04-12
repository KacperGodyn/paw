export interface Project {
  id: string;
  name: string;
  description: string;
}

export type StoryPriority = 'low' | 'medium' | 'high';
export type StoryStatus = 'todo' | 'doing' | 'done';

export interface Story {
  id: string;
  projectId: string;
  name: string;
  description: string;
  priority: StoryPriority;
  status: StoryStatus;
  ownerId: string | null;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  projectId: string;
  storyId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserId: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  estimatedTime: number | null;
}


export type UserRole = 'admin' | 'developer' | 'devops';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export const mockUsers: User[] = [
    { id: 'user-admin-01', firstName: 'Jan', lastName: 'Kowalski', role: 'admin' },
    { id: 'user-dev-01', firstName: 'Anna', lastName: 'Nowak', role: 'developer' },
    { id: 'user-dev-02', firstName: 'Katarzyna', lastName: 'Wiśniewska', role: 'developer' },
    { id: 'user-devops-01', firstName: 'Piotr', lastName: 'Zieliński', role: 'devops' },
    { id: 'user-devops-02', firstName: 'Marek', lastName: 'Kamiński', role: 'devops' },
];

export const getUserName = (userId: string | null): string => {
    if (!userId) return 'Unassigned';
    const user = mockUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
};

export const getAssignableUsers = (): User[] => {
    return mockUsers.filter(u => u.role === 'developer' || u.role === 'devops');
}; 