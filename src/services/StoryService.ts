import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Story } from '../models/index';

export class StoryService {
  static COLLECTION = 'stories';

  static async getStories(): Promise<Story[]> {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Story));
  }

  static async getStoriesByProject(projectId: string): Promise<Story[]> {
    const q = query(collection(db, this.COLLECTION), where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Story));
  }

  static async saveStories(stories: Story[]) {
  }

  static async addStory(story: Omit<Story, 'id'>): Promise<void> {
    await addDoc(collection(db, this.COLLECTION), story);
  }

  static async updateStory(updatedStory: Story): Promise<void> {
    const ref = doc(db, this.COLLECTION, updatedStory.id);
    const { id, ...data } = updatedStory;
    await updateDoc(ref, data);
  }

  static async deleteStory(id: string): Promise<void> {
    const ref = doc(db, this.COLLECTION, id);
    await deleteDoc(ref);
  }

  static async deleteStoriesByProject(projectId: string) {
  }
} 