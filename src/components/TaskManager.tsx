import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import {
  Task, TaskPriority, TaskStatus,
  Story,
  mockUsers, getAssignableUsers
} from "../models";
import { StoryService } from '../services/StoryService';
import { TaskService } from '../services/TaskService';
import {
    FiPlus, FiEdit, FiTrash2, FiUser, FiClock, FiTag, FiArrowUp, FiArrowRight, FiArrowDown,
    FiCheck, FiX, FiCalendar, FiChevronsRight, FiSquare, FiCheckSquare
} from 'react-icons/fi';

const getTaskPriorityIcon = (priority: TaskPriority): React.JSX.Element | null => {
    switch (priority) {
        case 'high': return <FiArrowUp className="h-4 w-4 text-red-500" title="Wysoki" />;
        case 'medium': return <FiArrowRight className="h-4 w-4 text-yellow-500" title="Średni" />;
        case 'low': return <FiArrowDown className="h-4 w-4 text-green-500" title="Niski" />;
        default: return null;
    }
};

const getTaskStatusStyle = (status: TaskStatus): { icon: React.JSX.Element; label: string; color: string } => {
    let icon: React.JSX.Element = <FiSquare className="h-4 w-4 text-gray-400" />;
    let label = 'Nieznany';
    let color = 'bg-gray-50';

    switch (status) {
        case 'todo':
            icon = <FiSquare className="h-4 w-4 text-gray-500" />;
            label = 'Do zrobienia';
            color = 'bg-gray-100';
            break;
        case 'doing':
            icon = <FiChevronsRight className="h-4 w-4 text-blue-500" />;
            label = 'W trakcie';
            color = 'bg-blue-50';
            break;
        case 'done':
            icon = <FiCheckSquare className="h-4 w-4 text-green-500" />;
            label = 'Zrobione';
            color = 'bg-green-50';
            break;
    }
    return { icon, label, color };
};

interface TaskManagerProps {
  activeProjectId: string | null;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ activeProjectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasksAndStories = async () => {
    if (activeProjectId) {
      setIsLoading(true);
      const [tasksData, storiesData] = await Promise.all([
        TaskService.getTasksByProject(activeProjectId),
        StoryService.getStoriesByProject(activeProjectId)
      ]);
      setTasks(tasksData);
      setStories(storiesData);
      setIsLoading(false);
    } else {
      setTasks([]);
      setStories([]);
    }
  };

  useEffect(() => {
    fetchTasksAndStories();
  }, [activeProjectId]);

  const groupedTasks = useMemo(() => {
    const groups: { [key in TaskStatus]: Task[] } = { todo: [], doing: [], done: [] };
    tasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
         console.warn(`Task ${task.id} has unknown status: ${task.status}`);
      }
    });
    return groups;
  }, [tasks]);

  const refreshTasks = async () => {
    if (activeProjectId) {
      setTasks(await TaskService.getTasksByProject(activeProjectId));
    }
  };

  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
     await TaskService.deleteTask(taskId);
     await refreshTasks();
   };

   const handleAssignUser = async (taskId: string, userId: string) => {
     await TaskService.assignTask(taskId, userId);
     await refreshTasks();
   };

   const handleCompleteTask = async (taskId: string) => {
     await TaskService.completeTask(taskId);
     await refreshTasks();
   };

  if (!activeProjectId) {
    return null;
  }

  if (isLoading) {
      return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-full flex items-center justify-center text-gray-500 dark:text-gray-300">
              Ładowanie zadań...
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zadania</h2>
        <button
          onClick={handleOpenAddTaskModal}
          className="flex items-center bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
          title="Dodaj nowe zadanie"
          data-cy="create-task"
        >
          {<FiPlus className="h-4 w-4 mr-1" /> as React.JSX.Element}
          Dodaj
        </button>
      </div>

      <div className="flex-grow overflow-hidden">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 pt-4 text-sm">Brak zadań dla tego projektu. Kliknij 'Dodaj'.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {(Object.keys(groupedTasks) as TaskStatus[]).map(statusKey => {
              const statusInfo = getTaskStatusStyle(statusKey);
              return (
                <div key={statusKey} className={`flex flex-col ${statusInfo.color} p-3 rounded-lg shadow-inner h-full overflow-hidden`}>
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-300 flex-shrink-0">
                    {statusInfo.icon}
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {statusInfo.label} ({groupedTasks[statusKey].length})
                    </h3>
                  </div>
                  <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {groupedTasks[statusKey].map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        stories={stories}
                        onEdit={handleOpenEditTaskModal}
                        onDelete={handleDeleteTask}
                        onAssign={handleAssignUser}
                        onComplete={handleCompleteTask}
                      />
                    ))}
                    {groupedTasks[statusKey].length === 0 && <p className="text-xs text-gray-400 text-center pt-2">Brak zadań</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={handleCloseModal}
          taskToEdit={editingTask}
          stories={stories}
          activeProjectId={activeProjectId}
          onTaskSaved={refreshTasks}
        />
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  stories: Story[]; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAssign: (taskId: string, userId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, stories, onEdit, onDelete, onAssign, onComplete }) => {
  const story = stories.find(s => s.id === task.storyId);
  const assignee = task.assignedUserId ? mockUsers.find(u => u.id === task.assignedUserId) : null;
  const assignableUsers = getAssignableUsers();

  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-150 ease-in-out text-sm">
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-medium text-gray-800 flex-grow mr-2 break-words">{task.name}</h4>
        <span className="flex-shrink-0">{getTaskPriorityIcon(task.priority)}</span>
      </div>

      {task.description && <p className="text-gray-600 mb-2 text-xs break-words">{task.description}</p>}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
        {story && (
          <div className="flex items-center space-x-1" title={`Historyjka: ${story.name}`}>
            {<FiTag className="h-3.5 w-3.5 text-purple-500" /> as React.JSX.Element}
            <span className="truncate max-w-[100px]">{story.name}</span>
          </div>
        )}
        <div className="flex items-center space-x-1" title={`Przypisany: ${assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Brak'}`}>
          {<FiUser className="h-3.5 w-3.5" /> as React.JSX.Element}
          <span>{assignee ? `${assignee.firstName.charAt(0)}${assignee.lastName.charAt(0)}` : '-'}</span>
        </div>
        {task.estimatedTime && (
          <div className="flex items-center space-x-1" title={`Szacowany czas: ${task.estimatedTime}h`}>
            {<FiClock className="h-3.5 w-3.5" /> as React.JSX.Element}
            <span>{task.estimatedTime}h</span>
          </div>
        )}
         {task.startDate && (
          <div className="flex items-center space-x-1" title={`Rozpoczęto: ${new Date(task.startDate).toLocaleDateString()}`}>
            {<FiCalendar className="h-3.5 w-3.5 text-blue-500" /> as React.JSX.Element}
          </div>
        )}
        {task.endDate && (
          <div className="flex items-center space-x-1" title={`Zakończono: ${new Date(task.endDate).toLocaleDateString()}`}>
            {<FiCalendar className="h-3.5 w-3.5 text-green-500" /> as React.JSX.Element}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-2 mt-2 flex flex-wrap justify-end items-center gap-x-1.5 gap-y-1">
        {task.status === 'todo' && (
          <select
            value=""
            onChange={(e) => {
                if (e.target.value) onAssign(task.id, e.target.value);
            }}
            className="text-xs border border-gray-200 p-1 rounded bg-white text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-5"
            title="Przypisz użytkownika"
          >
            <option value="" disabled>Przypisz...</option>
            {assignableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName.charAt(0)}.
              </option>
            ))}
          </select>
        )}
        {task.status === 'doing' && (
          <button
            onClick={() => onComplete(task.id)}
            className="flex items-center text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium py-0.5 px-1.5 rounded transition duration-150 ease-in-out"
            title="Oznacz jako zrobione"
          >
            {<FiCheck className="h-3.5 w-3.5 mr-0.5" /> as React.JSX.Element} Zrobione
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-blue-600 p-1 rounded transition duration-150 ease-in-out"
          title="Edytuj zadanie"
          data-cy="edit-task-icon"
        >
          {<FiEdit className="h-3.5 w-3.5" /> as React.JSX.Element}
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 p-1 rounded transition duration-150 ease-in-out"
          title="Usuń zadanie"
          data-cy="delete-task"
        >
          {<FiTrash2 className="h-3.5 w-3.5" /> as React.JSX.Element}
        </button>
      </div>
    </div>
  );
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit: Task | null;
  stories: Story[];
  activeProjectId: string;
  onTaskSaved: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, stories, activeProjectId, onTaskSaved }) => {
  const [name, setName] = useState<string>(taskToEdit?.name ?? "");
  const [description, setDescription] = useState<string>(taskToEdit?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority ?? 'medium');
  const [storyId, setStoryId] = useState<string | null>(taskToEdit?.storyId ?? null);
  const [estimatedTime, setEstimatedTime] = useState<string>(taskToEdit?.estimatedTime?.toString() ?? "");

  useEffect(() => {
    if (isOpen) {
      setName(taskToEdit?.name ?? "");
      setDescription(taskToEdit?.description ?? "");
      setPriority(taskToEdit?.priority ?? 'medium');
      setStoryId(taskToEdit?.storyId ?? null);
      setEstimatedTime(taskToEdit?.estimatedTime?.toString() ?? "");
    } else {
        setName("");
        setDescription("");
        setPriority('medium');
        setStoryId(null);
        setEstimatedTime("");
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!storyId) {
        alert("Wybierz historyjkę dla zadania.");
        return;
    }

    const baseTaskData = {
      name,
      description,
      priority,
      storyId,
      projectId: activeProjectId,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : null,
      status: 'todo' as TaskStatus,
      createdAt: new Date().toISOString(),
      startDate: null,
      endDate: null,
    };

    if (taskToEdit) {
      TaskService.updateTask({ ...taskToEdit, ...baseTaskData });
    } else {
      TaskService.addTask({ ...baseTaskData, assignedUserId: null });
    }
    onTaskSaved();
    onClose();
  };

  if (!isOpen) return null;

  const availableStories = stories.filter(s => s.status === 'todo' || s.status === 'doing');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {taskToEdit ? "Edytuj zadanie" : "Dodaj nowe zadanie"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Zamknij">
            {<FiX className="h-5 w-5" /> as React.JSX.Element}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Nazwa zadania</label>
            <input
              id="taskName"
              type="text"
              placeholder="Co trzeba zrobić?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              data-cy="task-name"
            />
          </div>

          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Opis</label>
            <textarea
              id="taskDescription"
              placeholder="Dodatkowe szczegóły (opcjonalnie)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="taskPriority" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Priorytet</label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                required
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
              </select>
            </div>
            <div>
              <label htmlFor="taskStory" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Historyjka</label>
              <select
                id="taskStory"
                value={storyId ?? ''}
                onChange={(e) => setStoryId(e.target.value || null)}
                required
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                data-cy="select-story"
              >
                <option value="" disabled>Wybierz historyjkę...</option>
                {availableStories.map(story => (
                  <option key={story.id} value={story.id}>{story.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="taskEstimatedTime" className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Szacowany czas (h)</label>
              <input
                id="taskEstimatedTime"
                type="number"
                min="0"
                step="0.1"
                placeholder="np. 2.5"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-2 w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-150 ease-in-out"
              data-cy="save-task"
            >
              {taskToEdit ? "Zapisz" : "Dodaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskManager; 