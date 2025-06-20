import React, { useState, useEffect } from "react";
import ProjectManager from "./components/ProjectManager";
import UserProfile from './components/UserProfile';
import StoryManager from './components/StoryManager';
import TaskManager from './components/TaskManager';
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const ACTIVE_PROJECT_ID_STORAGE_KEY = 'activeProjectId';

function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const storedAuth = localStorage.getItem('accessToken');
    return storedAuth ? localStorage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY) : null;
  });

  useEffect(() => {
    if (isAuthenticated && activeProjectId) {
      localStorage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, activeProjectId);
    } else if (!isAuthenticated) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_STORAGE_KEY);
    }
  }, [activeProjectId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
        setActiveProjectId(null);
    }
  }, [isAuthenticated]);

  const handleSelectProject = (projectId: string | null) => {
    setActiveProjectId(projectId);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <span className="text-gray-700 dark:text-gray-200">Ładowanie...</span>
          </div>
      );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 min-h-screen h-screen overflow-hidden">
      <div className="flex-shrink-0 w-full px-4 sm:px-6 lg:px-8 py-3 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <UserProfile />
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 px-3 py-1 rounded-md transition duration-150 ease-in-out"
          >
              Wyloguj
          </button>
        </div>
      </div>

      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 h-full flex flex-col overflow-hidden">
            <ProjectManager
              activeProjectId={activeProjectId}
              onSelectProject={handleSelectProject}
            />
          </div>

          <div className="lg:col-span-2 h-full flex flex-col overflow-hidden space-y-6">
            {activeProjectId ? (
              <>
                <StoryManager activeProjectId={activeProjectId} />
                <TaskManager activeProjectId={activeProjectId} />
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-500 dark:text-gray-300 h-full flex items-center justify-center">
                <p className="text-lg">Wybierz projekt z listy po lewej, aby zobaczyć historyjki i zadania.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
