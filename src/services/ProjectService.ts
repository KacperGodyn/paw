import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../models/index';

export class ProjectService {
  static COLLECTION = 'projects';

  static async getProjects(): Promise<Project[]> {
    const snapshot = await getDocs(collection(db, this.COLLECTION));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Project));
  }

  static async addProject(project: Omit<Project, 'id'>): Promise<void> {
    await addDoc(collection(db, this.COLLECTION), project);
  }

  static async updateProject(updatedProject: Project): Promise<void> {
    const ref = doc(db, this.COLLECTION, updatedProject.id);
    const { id, ...data } = updatedProject;
    await updateDoc(ref, data);
  }

  static async deleteProject(id: string): Promise<void> {
    const ref = doc(db, this.COLLECTION, id);
    await deleteDoc(ref);
  }
} 