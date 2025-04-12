// src/models.ts

// --- User Model ---
export type UserRole = 'admin' | 'devops' | 'developer';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole; // Added role
}

// --- Mock Users (Centralized) ---
export const mockUsers: User[] = [
  // Keep the original mock user from UserProfile as an admin conceptually
  // For assignments, we'll use this list:
  { id: "user-admin-01", firstName: "Jan", lastName: "Kowalski", role: "admin" }, // The one from UserProfile
  { id: "user-dev-01", firstName: "Alicja", lastName: "Nowak", role: "developer" },
  { id: "user-dev-02", firstName: "Piotr", lastName: "Zieliński", role: "developer" },
  { id: "user-ops-01", firstName: "Ewa", lastName: "Lis", role: "devops" },
  { id: "", firstName: "-", lastName: "Unassigned", role: "developer" }, // Keep unassigned option
];

// Helper to get user name by ID
export const getUserName = (userId: string | null): string => {
  if (!userId || userId === "") return "Unassigned";
  const user = mockUsers.find(u => u.id === userId);
  return user ? `${user.firstName} ${user.lastName} (${user.role})` : "Unknown User";
};

// Helper to get assignable users (devs and devops)
export const getAssignableUsers = (): User[] => {
  return mockUsers.filter(user => user.id !== "" && (user.role === 'developer' || user.role === 'devops'));
};

// --- Story Model (Existing) ---
export type StoryStatus = 'todo' | 'doing' | 'done';
export type StoryPriority = 'low' | 'medium' | 'high';

export interface Story {
  id: string;
  name: string;
  description: string;
  priority: StoryPriority;
  projectId: string;
  createdAt: string;
  status: StoryStatus;
  ownerId: string | null; // User ID
}

// --- Task Model (New) ---
export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: string; // Link to the parent story
  projectId: string; // Link to the parent project (for easier filtering)
  estimatedTime: number | null; // Estimated hours, null if not set
  status: TaskStatus;
  createdAt: string; // ISO date string
  startDate: string | null; // ISO date string, set when status -> doing
  endDate: string | null; // ISO date string, set when status -> done
  assignedUserId: string | null; // User ID (developer or devops)
} 