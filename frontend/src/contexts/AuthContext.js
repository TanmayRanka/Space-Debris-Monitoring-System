import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual authentication
      const mockResponse = await mockAuthAPI(credentials);
      
      if (mockResponse.success) {
        const { user: userData, token } = mockResponse.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(mockResponse.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual registration
      const mockResponse = await mockRegisterAPI(userData);
      
      if (mockResponse.success) {
        const { user: newUser, token } = mockResponse.data;
        
        // Store auth data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        setUser(newUser);
        setIsAuthenticated(true);
        
        return { success: true, user: newUser };
      } else {
        throw new Error(mockResponse.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      
      // Mock API call - replace with actual profile update
      const updatedUser = { ...user, ...profileData };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.message || 'Profile update failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'export_data', 'system_settings'],
      operator: ['read', 'write', 'export_data'],
      viewer: ['read']
    };
    
    return rolePermissions[user?.role]?.includes(permission) || false;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock authentication API functions
const mockAuthAPI = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { email, password } = credentials;
  
  // Mock user database
  const mockUsers = [
    {
      id: '1',
      email: 'admin@orbitops.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      avatar: null,
      preferences: {
        theme: 'dark',
        notifications: true,
        autoRefresh: true
      }
    },
    {
      id: '2',
      email: 'operator@orbitops.com',
      password: 'operator123',
      name: 'Mission Operator',
      role: 'operator',
      avatar: null,
      preferences: {
        theme: 'dark',
        notifications: true,
        autoRefresh: true
      }
    },
    {
      id: '3',
      email: 'viewer@orbitops.com',
      password: 'viewer123',
      name: 'Data Analyst',
      role: 'viewer',
      avatar: null,
      preferences: {
        theme: 'dark',
        notifications: false,
        autoRefresh: false
      }
    }
  ];
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token: `mock_token_${user.id}_${Date.now()}`
      }
    };
  } else {
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }
};

const mockRegisterAPI = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { email, password, name, role = 'viewer' } = userData;
  
  // Mock validation
  if (!email || !password || !name) {
    return {
      success: false,
      message: 'All fields are required'
    };
  }
  
  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  // Check if email already exists (mock check)
  const existingEmails = ['admin@orbitops.com', 'operator@orbitops.com', 'viewer@orbitops.com'];
  if (existingEmails.includes(email)) {
    return {
      success: false,
      message: 'Email already exists'
    };
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    role,
    avatar: null,
    preferences: {
      theme: 'dark',
      notifications: true,
      autoRefresh: true
    }
  };
  
  return {
    success: true,
    data: {
      user: newUser,
      token: `mock_token_${newUser.id}_${Date.now()}`
    }
  };
};

export default AuthContext;