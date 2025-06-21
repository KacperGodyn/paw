import React, { useState } from 'react';
import { User, UserRole } from '../models';
import { FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>({
    id: "user-admin-01",
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'admin'
  });

  const { theme, toggleTheme } = useTheme();

  const roleDisplay: { [key in User['role']]: string } = {
      admin: 'Administrator',
      developer: 'Developer',
      devops: 'DevOps'
  };

  const loggedInIcon: React.JSX.Element = <FiUser className="h-5 w-5 text-gray-600" />;
  const loggedOutIcon: React.JSX.Element = <FiUser className="h-5 w-5 text-gray-400" />;

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={toggleTheme}
        className="mr-1 p-1 rounded-full border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        title={theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
        aria-label="Przełącz motyw"
      >
        {theme === 'dark' ? (
          <FiSun className="h-4 w-4 text-yellow-400" />
        ) : (
          <FiMoon className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {user ? (
        <>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800">
                {loggedInIcon}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-blue-600 font-medium capitalize"> 
              {roleDisplay[user.role] || user.role}
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-2">
           <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800">
                 {loggedOutIcon}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Not Logged In</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 