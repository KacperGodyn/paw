// src/services/StoryService.ts
import { v4 as uuidv4 } from "uuid";
import { Story, StoryPriority, StoryStatus } from "../models";

// --- StoryService Class ---
export class StoryService {
  static STORAGE_KEY = "stories";

  // Get all stories from storage
  static getStories(): Story[] {
    const stories = localStorage.getItem(this.STORAGE_KEY);
    return stories ? JSON.parse(stories) : [];
  }

  // Get stories only for a specific project
  static getStoriesByProject(projectId: string): Story[] {
    return this.getStories().filter(story => story.projectId === projectId);
  }

  // Save all stories back to storage
  static saveStories(stories: Story[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stories));
  }

  // Add a new story
  static addStory(storyData: Omit<Story, "id" | "createdAt">) {
    const stories = this.getStories();
    const newStory: Story = {
      ...storyData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    stories.push(newStory);
    this.saveStories(stories);
  }

  // Update an existing story
  static updateStory(updatedStory: Story) {
    let stories = this.getStories();
    stories = stories.map((story) =>
      story.id === updatedStory.id ? updatedStory : story
    );
    this.saveStories(stories);
  }

  // Delete a story by ID
  static deleteStory(id: string) {
    let stories = this.getStories();

    const relatedTasks = localStorage.getItem("tasks");
    if (relatedTasks) {
      const tasks = JSON.parse(relatedTasks);
      const storyHasTasks = tasks.some((task: { storyId: string }) => task.storyId === id);
      if (storyHasTasks) {
        alert("Cannot delete story: It has associated tasks.");
        return; 
      }
    }

    stories = stories.filter((story) => story.id !== id);
    this.saveStories(stories);
  }

  // Delete all stories associated with a specific project ID
  static deleteStoriesByProject(projectId: string) {
    let stories = this.getStories();
    stories = stories.filter(story => story.projectId !== projectId);
    this.saveStories(stories);
  }
} 