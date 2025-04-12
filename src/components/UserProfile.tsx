import React, { useState } from 'react';
import { User, UserRole } from '../models';
import { FiUser } from 'react-icons/fi';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>({
    id: "user-admin-01",
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'admin'
  });

  const roleDisplay: { [key in User['role']]: string } = {
      admin: 'Administrator',
      developer: 'Developer',
      devops: 'DevOps'
  };

  const loggedInIcon: React.JSX.Element = <FiUser className="h-5 w-5 text-gray-600" />;
  const loggedOutIcon: React.JSX.Element = <FiUser className="h-5 w-5 text-gray-400" />;


  return (
    <div className="flex items-center space-x-3">
      {user ? (
        <>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200">
                {loggedInIcon}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-blue-600 font-medium capitalize"> 
              {roleDisplay[user.role] || user.role}
            </p>
          </div>
        </>
      ) : (
        <div className="flex items-center space-x-2">
           <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200">
                 {loggedOutIcon}
            </span>
            <p className="text-sm text-gray-500">Not Logged In</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 