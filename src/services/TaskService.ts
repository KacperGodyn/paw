import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Task, mockUsers } from "../models";

export class TaskService {
  static COLLECTION = 'tasks';

  static async getTasks(): Promise<Task[]> {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Task));
  }

  static async getTasksByProject(projectId: string): Promise<Task[]> {
    const q = query(collection(db, this.COLLECTION), where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Task));
  }

  static async getTasksByStory(storyId: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => task.storyId === storyId);
  }


  static async addTask(task: Omit<Task, 'id'>): Promise<void> {
    await addDoc(collection(db, this.COLLECTION), task);
  }

  static async updateTask(updatedTask: Task): Promise<void> {
    const ref = doc(db, this.COLLECTION, updatedTask.id);
    const { id, ...data } = updatedTask;
    await updateDoc(ref, data);
  }

  static async assignTask(taskId: string, userId: string): Promise<void> {
    const ref = doc(db, this.COLLECTION, taskId);
    await updateDoc(ref, { assignedUserId: userId });
  }

  static async completeTask(taskId: string): Promise<void> {
    const ref = doc(db, this.COLLECTION, taskId);
    await updateDoc(ref, { status: 'done' });
  }

  static async deleteTask(id: string): Promise<void> {
    const ref = doc(db, this.COLLECTION, id);
    await deleteDoc(ref);
  }

  static async deleteTasksByProject(projectId: string) {
    const q = query(collection(db, this.COLLECTION), where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnap => {
      const ref = doc(db, this.COLLECTION, docSnap.id);
      batch.delete(ref);
    });
    await batch.commit();
  }

  static async deleteTasksByStory(storyId: string) {
    const tasks = await this.getTasks();
    const batch = writeBatch(db);
    tasks.filter(task => task.storyId === storyId).forEach(task => {
      const ref = doc(db, this.COLLECTION, task.id);
      batch.delete(ref);
    });
    await batch.commit();
  }
} 