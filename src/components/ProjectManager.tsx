import React, { useState, useEffect, FormEvent } from "react";
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { ProjectService } from '../services/ProjectService';
import { Project } from '../models/index';

interface ProjectManagerProps {
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
}

export default function ProjectManager({ activeProjectId, onSelectProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await ProjectService.getProjects();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      await ProjectService.updateProject({ id: editingProject.id, name, description });
      setEditingProject(null);
    } else {
      await ProjectService.addProject({ name, description });
    }
    await fetchProjects();
    setName("");
    setDescription("");
  };

  const handleEdit = (project: Project) => {
    setName(project.name);
    setDescription(project.description);
    setEditingProject(project);
  };

  const handleDelete = async (id: string) => {
    await ProjectService.deleteProject(id);
    if (id === activeProjectId) {
      onSelectProject(null);
    }
    await fetchProjects();
  };

  const handleSelect = (id: string) => {
    onSelectProject(id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Projekty</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              id="projectName"
              type="text"
              placeholder="Nazwa projektu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              data-cy="project-name"
            />
          </div>
          <div>
            <textarea
              id="projectDescription"
              placeholder="Opis (opcjonalnie)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button data-cy="save-project" type="submit" className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm">
            {editingProject ? "Zapisz zmiany" : "Dodaj projekt"}
          </button>
        </form>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">Ładowanie projektów...</p>
        ) : projects.length > 0 ? (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const ActiveIcon: React.JSX.Element | null = isActive ? <FiCheckCircle className="text-green-600 h-4 w-4" title="Aktywny"/> : null;

            return (
              <div
                key={project.id}
                className={`p-3 rounded-md border flex justify-between items-center cursor-pointer transition-colors duration-150 ease-in-out ${isActive ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                onClick={() => handleSelect(project.id)}
              >
                <div className="flex-grow mr-2">
                  <strong className={`text-base font-medium block truncate ${isActive ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-100'}`}>{project.name}</strong>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-1.5">
                  {ActiveIcon}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                    className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition duration-150 ease-in-out"
                    title="Edytuj"
                    data-cy="edit-project-icon"
                  >
                    {<FiEdit className="h-4 w-4" /> as React.JSX.Element}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition duration-150 ease-in-out"
                    title="Usuń"
                    data-cy="delete-project"
                  >
                    {<FiTrash2 className="h-4 w-4" /> as React.JSX.Element}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">Brak projektów. Dodaj nowy powyżej.</p>
        )}
      </div>
    </div>
  );
}
