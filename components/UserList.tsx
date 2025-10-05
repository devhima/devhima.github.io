import React from 'react';
import type { User } from '../types';
import { PlusIcon } from '../PlusIcon';
import { UserIcon } from './icons/UserIcon';
import { DataUsageIcon } from '../DataUsageIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onAddUserClick: () => void;
  onDeleteUser: (userId: string) => void;
  onSelectHistory: (user: User) => void;
  onClearAllUsersHistory: () => void;
  onClearAllData: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const UserList: React.FC<UserListProps> = ({ users, onSelectUser, onAddUserClick, onDeleteUser, onSelectHistory, onClearAllUsersHistory, onClearAllData }) => {
  return (
    <div className="h-full flex flex-col">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Data Tracker</h1>
            <p className="text-gray-400">Select a user to begin tracking.</p>
          </div>
          {users.length > 0 && (
            <div className="flex items-center gap-2">
               <button
                onClick={onClearAllUsersHistory}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-800 bg-opacity-50 text-yellow-400 hover:bg-yellow-900 hover:bg-opacity-100 hover:text-yellow-300 transition-all"
                aria-label="Reset all users' history"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Reset History</span>
              </button>
              <button
                onClick={onClearAllData}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-800 bg-opacity-50 text-red-400 hover:bg-red-900 hover:bg-opacity-100 hover:text-red-300 transition-all"
                aria-label="Clear all user data"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">Clear All</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-grow space-y-4 pb-20">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:bg-gray-700">
              <div className="flex items-center space-x-4 cursor-pointer flex-grow" onClick={() => onSelectUser(user)}>
                <div className="bg-primary-variant p-3 rounded-full">
                  <UserIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                   <div 
                     onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onSelectHistory(user);
                     }}
                     className="flex items-center text-sm text-gray-400 space-x-1.5 mt-1 cursor-pointer hover:text-secondary transition-colors group"
                     role="button"
                     aria-label={`View usage history for ${user.name}`}
                    >
                    <DataUsageIcon className="w-4 h-4" />
                    <span>{formatBytes(user.totalUsage)} used</span>
                    <ChartBarIcon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  onDeleteUser(user.id);
                }} 
                className="p-2 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                aria-label={`Delete ${user.name}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No users found.</p>
            <p>Click the '+' button to add one.</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-6">
        <button 
          onClick={onAddUserClick}
          className="bg-secondary text-brand-bg rounded-full p-4 shadow-lg hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary transition-transform transform hover:scale-110"
          aria-label="Add new user"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default UserList;