
import React, { useState } from 'react';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (name: string) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddUser(name.trim());
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-8 shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Add New User</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user's name"
            className="w-full bg-gray-700 text-white rounded-md px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-secondary"
            autoFocus
          />
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 rounded-md bg-secondary text-brand-bg font-semibold hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name.trim()}
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
