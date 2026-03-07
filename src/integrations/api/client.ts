const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_role', data.role);
    }
    return data;
  },

  signUp: async (email: string, password: string, full_name?: string, role: 'admin' | 'staff' = 'staff') => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, role }),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_role', role);
    }
    return data;
  },

  signOut: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    return apiRequest('/tasks');
  },

  getUnassigned: async () => {
    return apiRequest('/tasks/unassigned');
  },

  getAssigned: async () => {
    return apiRequest('/tasks/assigned');
  },

  getByStatus: async (status: string) => {
    return apiRequest(`/tasks/status/${status}`);
  },

  getMyTasks: async () => {
    return apiRequest('/tasks/my-tasks');
  },

  getById: async (id: string) => {
    return apiRequest(`/tasks/${id}`);
  },

  search: async (query: string, filters?: { status?: string; assigned_to?: string }) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    return apiRequest(`/tasks/search?${params.toString()}`);
  },

  create: async (task: {
    customer_name: string;
    contact_number: string;
    device_name: string;
    accessories_received?: string;
    problem_reported: string;
  }) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  update: async (id: string, updates: any) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  addComment: async (id: string, text: string) => {
    return apiRequest(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Staff API
export const staffAPI = {
  getAll: async () => {
    return apiRequest('/staff');
  },

  create: async (staff: { email: string; password: string; full_name?: string }) => {
    return apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  },

  updateStatus: async (id: string, status: 'active' | 'disabled') => {
    return apiRequest(`/staff/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/staff/${id}`, {
      method: 'DELETE',
    });
  },
};

// Profiles API
export const profilesAPI = {
  getAll: async () => {
    return apiRequest('/profiles');
  },

  getById: async (id: string) => {
    return apiRequest(`/profiles/${id}`);
  },
};
