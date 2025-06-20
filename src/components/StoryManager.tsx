import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import {
  Story, StoryPriority, StoryStatus,
  mockUsers
} from "../models";
import { StoryService } from '../services/StoryService';
import {
  FiPlus, FiEdit, FiTrash2, FiUser, FiArrowUp, FiArrowRight, FiArrowDown,
  FiCheckSquare, FiSquare, FiChevronsRight
} from 'react-icons/fi';

const getPriorityIcon = (priority: StoryPriority): React.JSX.Element | null => {
  switch (priority) {
    case 'high': return <FiArrowUp className="text-red-500" title="Wysoki" />;
    case 'medium': return <FiArrowRight className="text-yellow-500" title="Średni" />;
    case 'low': return <FiArrowDown className="text-green-500" title="Niski" />;
    default: return null;
  }
};

const getStatusStyle = (status: StoryStatus): { icon: React.JSX.Element; label: string; color: string } => {
  let icon: React.JSX.Element = <FiSquare />;
  let label = 'Nieznany';
  let color = 'bg-gray-50';

  switch (status) {
    case 'todo':
      icon = <FiSquare className="text-gray-500"/>;
      label = 'Do zrobienia';
      color = 'bg-gray-100';
      break;
    case 'doing':
      icon = <FiChevronsRight className="text-blue-500"/>;
      label = 'W trakcie';
      color = 'bg-blue-50';
      break;
    case 'done':
      icon = <FiCheckSquare className="text-green-500"/>;
      label = 'Zrobione';
      color = 'bg-green-50';
      break;
  }
  return { icon, label, color };
};

const defaultStoryValues: Omit<Story, "id" | "createdAt" | "projectId"> = {
  name: "",
  description: "",
  priority: "medium",
  status: "todo",
  ownerId: null,
};

interface StoryCardProps {
  story: Story;
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onEdit, onDelete }) => {
  const owner = story.ownerId ? mockUsers.find(u => u.id === story.ownerId) : null;

  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-150 ease-in-out">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-800 flex-grow mr-2 break-words">{story.name}</h4>
        <div className="flex-shrink-0 flex items-center space-x-1.5">
          <button
            onClick={() => onEdit(story)}
            className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition duration-150 ease-in-out"
            title="Edytuj"
          >
            {<FiEdit className="h-3.5 w-3.5" /> as React.JSX.Element}
          </button>
          <button
            onClick={() => onDelete(story.id)}
            className="text-gray-400 hover:text-red-600 p-0.5 rounded transition duration-150 ease-in-out"
            title="Usuń"
          >
            {<FiTrash2 className="h-3.5 w-3.5" /> as React.JSX.Element}
          </button>
        </div>
      </div>
      {story.description && <p className="text-xs text-gray-600 mb-2 break-words">{story.description}</p>}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          {getPriorityIcon(story.priority)}
        </div>
        <div className="flex items-center space-x-1" title={owner ? `${owner.firstName} ${owner.lastName}` : 'Nieprzypisany'}>
          {<FiUser className="h-3.5 w-3.5" /> as React.JSX.Element}
          <span>{owner ? `${owner.firstName.charAt(0)}${owner.lastName.charAt(0)}` : '-'}</span>
        </div>
      </div>
    </div>
  );
};

interface StoryManagerProps {
  activeProjectId: string | null;
}

const StoryManager: React.FC<StoryManagerProps> = ({ activeProjectId }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState<string>(defaultStoryValues.name);
  const [description, setDescription] = useState<string>(defaultStoryValues.description);
  const [priority, setPriority] = useState<StoryPriority>(defaultStoryValues.priority);
  const [status, setStatus] = useState<StoryStatus>(defaultStoryValues.status);
  const [ownerId, setOwnerId] = useState<string | null>(defaultStoryValues.ownerId);

  const fetchStories = async () => {
    if (activeProjectId) {
      setLoading(true);
      const data = await StoryService.getStoriesByProject(activeProjectId);
      setStories(data);
      setLoading(false);
    } else {
      setStories([]);
    }
  };

  useEffect(() => {
    fetchStories();
    resetForm();
    setIsFormVisible(false);
  }, [activeProjectId]);

  const groupedStories = useMemo(() => {
    const groups: { [key in StoryStatus]: Story[] } = { todo: [], doing: [], done: [] };
    stories.forEach(story => {
      if (groups[story.status]) {
        groups[story.status].push(story);
      }
    });
    return groups;
  }, [stories]);

  const resetForm = () => {
    setEditingStory(null);
    setName(defaultStoryValues.name);
    setDescription(defaultStoryValues.description);
    setPriority(defaultStoryValues.priority);
    setStatus(defaultStoryValues.status);
    setOwnerId(defaultStoryValues.ownerId);
  };

  const handleShowAddForm = () => {
    resetForm();
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsFormVisible(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const storyData = { name, description, priority, status, ownerId: ownerId || null, projectId: activeProjectId, createdAt: new Date().toISOString() };

    if (editingStory) {
      await StoryService.updateStory({ ...editingStory, ...storyData });
    } else {
      await StoryService.addStory(storyData);
    }

    await fetchStories();
    resetForm();
    setIsFormVisible(false);
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setName(story.name);
    setDescription(story.description);
    setPriority(story.priority);
    setStatus(story.status);
    setOwnerId(story.ownerId);
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    await StoryService.deleteStory(id);
    await fetchStories();
    if (editingStory?.id === id) {
      resetForm();
      setIsFormVisible(false);
    }
  };

  if (!activeProjectId) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Historyjki</h2>
        <button
          onClick={handleShowAddForm}
          className="flex items-center bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
          title="Dodaj nową historyjkę"
        >
          {<FiPlus className="h-4 w-4 mr-1" /> as React.JSX.Element}
          Dodaj
        </button>
      </div>

      {isFormVisible && (
        <div className="flex-shrink-0 mb-4 border-t border-b border-gray-200 dark:border-gray-700 py-4 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-3">
            {editingStory ? "Edytuj historyjkę" : "Dodaj nową historyjkę"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              id="storyName"
              type="text"
              placeholder="Nazwa historyjki"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <textarea
              id="storyDescription"
              placeholder="Opis (opcjonalnie)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                id="storyPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as StoryPriority)}
                required
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="" disabled>Priorytet...</option>
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
              </select>
              <select
                id="storyStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as StoryStatus)}
                required
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              >
                 <option value="" disabled>Status...</option>
                 <option value="todo">Do zrobienia</option>
                 <option value="doing">W trakcie</option>
                 <option value="done">Zrobione</option>
              </select>
              <select
                id="storyOwner"
                value={ownerId ?? ""}
                onChange={(e) => setOwnerId(e.target.value || null)}
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Właściciel (opcjonalnie)...</option>
                {mockUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 px-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
              >
                {editingStory ? "Zapisz" : "Dodaj"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-grow overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 pt-4 text-sm">Ładowanie historyjek...</p>
        ) : stories.length === 0 && !isFormVisible ? (
          <p className="text-center text-gray-500 pt-4 text-sm">Brak historyjek dla tego projektu. Kliknij 'Dodaj'.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {Object.entries(groupedStories).map(([statusKey, statusStories]) => {
              const statusInfo = getStatusStyle(statusKey as StoryStatus);
              return (
                <div key={statusKey} className={`flex flex-col ${statusInfo.color} p-3 rounded-lg shadow-inner h-full overflow-hidden`}>
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-300 flex-shrink-0">
                    {statusInfo.icon}
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {statusInfo.label} ({statusStories.length})
                    </h3>
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {statusStories.map(story => (
                      <StoryCard key={story.id} story={story} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                    {statusStories.length === 0 && <p className="text-xs text-gray-400 text-center pt-2">Brak historyjek</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryManager; 