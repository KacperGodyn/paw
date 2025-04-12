// src/services/TaskService.ts
import { v4 as uuidv4 } from "uuid";
import { Task, mockUsers } from "../models";

// --- TaskService Class ---
export class TaskService {
  static STORAGE_KEY = "tasks";

  // Get all tasks from storage
  static getTasks(): Task[] {
    const tasks = localStorage.getItem(this.STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
  }

  // Get tasks only for a specific project
  static getTasksByProject(projectId: string): Task[] {
    return this.getTasks().filter(task => task.projectId === projectId);
  }

  // Get tasks only for a specific story
  static getTasksByStory(storyId: string): Task[] {
    return this.getTasks().filter(task => task.storyId === storyId);
  }

  // Save all tasks back to storage
  static saveTasks(tasks: Task[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  // Add a new task
  static addTask(taskData: Omit<Task, "id" | "createdAt" | "startDate" | "endDate" | "status">): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'todo', // Default status
      startDate: null,
      endDate: null,
      ...taskData,
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  // Update an existing task (handles status changes and dates)
  static updateTask(updatedTask: Task): Task | null {
    let tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index === -1) {
      console.error("Task not found for update:", updatedTask.id);
      return null; // Task not found
    }

    const originalTask = tasks[index];
    let finalTask = { ...originalTask, ...updatedTask };

    // Handle status transitions and date/user assignments
    if (originalTask.status !== finalTask.status) {
      if (finalTask.status === 'doing') {
        if (finalTask.assignedUserId) {
             finalTask.startDate = finalTask.startDate || new Date().toISOString(); // Set start date if not already set
             finalTask.endDate = null; // Ensure end date is null
        } else {
            console.warn("Cannot move task to 'doing' without an assigned user.");
            finalTask.status = originalTask.status; // Revert status change
        }
      } else if (finalTask.status === 'done') {
        if (finalTask.assignedUserId && finalTask.startDate) {
             finalTask.endDate = finalTask.endDate || new Date().toISOString(); // Set end date if not already set
        } else {
            console.warn("Cannot move task to 'done' without an assigned user and start date.");
             finalTask.status = originalTask.status; // Revert status change
        }
      } else if (finalTask.status === 'todo') {
         finalTask.startDate = null;
         finalTask.endDate = null;
         // Optionally unassign user? Depends on requirements.
         // finalTask.assignedUserId = null;
      }
    }
    // Ensure assigned user exists if status is doing or done
    if ((finalTask.status === 'doing' || finalTask.status === 'done') && !finalTask.assignedUserId) {
        console.warn(`Task ${finalTask.id} moved to ${finalTask.status} but has no assigned user.`);
        // Decide: revert status or allow? For now, allow but warn.
    }


    tasks[index] = finalTask;
    this.saveTasks(tasks);
    return finalTask;
  }

  // Assign user to task (automatically moves to 'doing')
  static assignTask(taskId: string, userId: string): Task | null {
      const task = this.getTasks().find(t => t.id === taskId);
      if (!task) return null;
      if (task.status !== 'todo') {
          console.warn("Can only assign users to tasks in 'todo' status.");
          return task; // Or null?
      }
      const user = mockUsers.find(u => u.id === userId);
      if (!user || (user.role !== 'developer' && user.role !== 'devops')) {
          console.error("Invalid user or user role for assignment.");
          return task;
      }

      task.assignedUserId = userId;
      task.status = 'doing';
      task.startDate = new Date().toISOString();
      task.endDate = null;
      return this.updateTask(task);
  }

  // Complete task (moves to 'done')
  static completeTask(taskId: string): Task | null {
      const task = this.getTasks().find(t => t.id === taskId);
       if (!task) return null;
       if (task.status !== 'doing') {
           console.warn("Can only complete tasks that are in 'doing' status.");
           return task;
       }
       if (!task.assignedUserId || !task.startDate) {
            console.error("Cannot complete task without assigned user and start date.");
            return task;
       }
       task.status = 'done';
       task.endDate = new Date().toISOString();
       return this.updateTask(task);
   }


  // Delete a task by ID
  static deleteTask(id: string): boolean {
    let tasks = this.getTasks();
    const initialLength = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    if (tasks.length < initialLength) {
      this.saveTasks(tasks);
      return true;
    }
    return false;
  }

  // Delete all tasks associated with a specific project ID
  static deleteTasksByProject(projectId: string) {
    let tasks = this.getTasks();
    tasks = tasks.filter(task => task.projectId !== projectId);
    this.saveTasks(tasks);
  }

  // Delete all tasks associated with a specific story ID
  static deleteTasksByStory(storyId: string) {
    let tasks = this.getTasks();
    tasks = tasks.filter(task => task.storyId !== storyId);
    this.saveTasks(tasks);
  }
} 