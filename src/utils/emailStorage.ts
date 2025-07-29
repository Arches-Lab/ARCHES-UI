export interface SavedUser {
  email: string;
  name: string;
  lastLogin: string;
}

const STORAGE_KEY = 'arches_saved_users';

export const emailStorage = {
  // Get all saved users
  getSavedUsers: (): SavedUser[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading saved users from localStorage:', error);
      return [];
    }
  },

  // Save a user to the collection
  saveUser: (email: string, name: string): void => {
    try {
      const users = emailStorage.getSavedUsers();
      const existingUserIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
      
      const userData: SavedUser = {
        email: email.toLowerCase(),
        name: name || email.split('@')[0], // Use email prefix if no name provided
        lastLogin: new Date().toISOString()
      };

      if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = userData;
      } else {
        // Add new user
        users.push(userData);
      }

      // Keep only the last 10 users
      const sortedUsers = users.sort((a, b) => 
        new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()
      ).slice(0, 10);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedUsers));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  // Remove a user from the collection
  removeUser: (email: string): void => {
    try {
      const users = emailStorage.getSavedUsers();
      const filteredUsers = users.filter(user => 
        user.email.toLowerCase() !== email.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers));
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  },

  // Clear all saved users
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved users from localStorage:', error);
    }
  }
}; 