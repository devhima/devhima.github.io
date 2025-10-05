import React, { useState } from 'react';
import type { User } from './types';
import { useUserData } from './hooks/useUserData';
import UserList from './components/UserList';
import TrackingView from './components/TrackingView';
import AddUserModal from './components/AddUserModal';
import UsageHistoryView from './components/UsageHistoryView';

type Screen = 'list' | 'tracking' | 'history';

const App: React.FC = () => {
  const { users, addUser, updateUserUsage, deleteUser, clearUserHistory, clearAllUsersHistory, clearAllData } = useUserData();
  const [activeScreen, setActiveScreen] = useState<Screen>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setActiveScreen('tracking');
  };

  const handleViewHistory = (user: User) => {
    setSelectedUser(user);
    setActiveScreen('history');
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setActiveScreen('list');
  };

  const handleStopTracking = (sessionUsage: number) => {
    if (selectedUser) {
      updateUserUsage(selectedUser.id, sessionUsage);
    }
    handleBackToList();
  };

  const handleAddUser = (name: string) => {
    addUser(name);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    // A simple confirmation dialog
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleClearHistory = (userId: string) => {
    if (window.confirm('Are you sure you want to clear all usage history for this user? This action cannot be undone.')) {
      clearUserHistory(userId);
    }
  };

  const handleClearAllUsersHistory = () => {
    if (window.confirm('Are you sure you want to reset the usage history for ALL users? This action is permanent and cannot be undone.')) {
        clearAllUsersHistory();
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL user data? This action is permanent and cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-white flex justify-center items-start pt-4 sm:pt-8">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden relative" style={{ height: '80vh', minHeight: '600px' }}>
        <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6">
          {activeScreen === 'list' && (
            <UserList 
              users={users} 
              onSelectUser={handleSelectUser}
              onAddUserClick={() => setIsModalOpen(true)}
              onDeleteUser={handleDeleteUser}
              onSelectHistory={handleViewHistory}
              onClearAllUsersHistory={handleClearAllUsersHistory}
              onClearAllData={handleClearAllData}
            />
          )}
          {activeScreen === 'tracking' && selectedUser && (
            <TrackingView
              user={selectedUser}
              onStopTracking={handleStopTracking}
              onBack={handleBackToList}
            />
          )}
          {activeScreen === 'history' && selectedUser && (
            <UsageHistoryView
              user={selectedUser}
              onBack={handleBackToList}
              onClearHistory={handleClearHistory}
            />
          )}
        </div>
        
        {isModalOpen && (
          <AddUserModal
            onClose={() => setIsModalOpen(false)}
            onAddUser={handleAddUser}
          />
        )}
      </div>
    </div>
  );
};

export default App;