import { createClient } from '@supabase/supabase-js';

const API_URL = 'http://localhost:5000/api';
const SUPABASE_URL = 'https://scfdicipcqzscxxgdktq.supabase.co'; // Replace with your actual Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZmRpY2lwY3F6c2N4eGdka3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTU5OTEsImV4cCI6MjA4MTc3MTk5MX0.3Bq2BIW5Kz1rAr3ZdVcIOm5F8p3fGuGMCymUYelrLpE'; // Replace with your actual Supabase Anon Key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


let authToken = null;
try {
  authToken = localStorage.getItem('token');
} catch (e) {
  authToken = null;
}

export const setAuthToken = (token) => {
  authToken = token;
  console.log('setAuthToken called, token present?', !!token);
  try {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  } catch (e) {
    // ignore localStorage failures
  }
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = authToken;
  try {
    if (token) {
      // show only a masked portion of the token for debugging
      const masked = `${token.slice(0, 8)}...${token.slice(-8)}`;
      console.log('getAuthHeaders - token present:', true, 'masked:', masked);
    } else {
      console.log('getAuthHeaders - token present: false');
    }
  } catch (e) {
    console.log('getAuthHeaders - token inspect failed', e);
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Authentication
  register: async (data) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register');
    }
    return response.json();
  },
  
  login: async (data) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }
    return response.json();
  },
  
  getCurrentUser: async () => {
    console.log('getCurrentUser - headers:', getAuthHeaders());
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }
    return response.json();
  },

  // Colleges
  getColleges: async (search = '', page = 1, limit = 10, sortConfig = null) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page);
    if (limit) params.append('per_page', limit);
    if (sortConfig) {
      params.append('sort_by', sortConfig.key);
      params.append('sort_order', sortConfig.direction);
    }

    const response = await fetch(`${API_URL}/colleges?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch colleges');
    }
    return response.json();
  },
  
  createCollege: async (data) => {
    const response = await fetch(`${API_URL}/colleges`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create college');
    }
    return response.json();
  },
  
  updateCollege: async (code, data) => {
    const response = await fetch(`${API_URL}/colleges/${code}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update college');
    }
    return response.json();
  },
  
  deleteCollege: async (code) => {
    const response = await fetch(`${API_URL}/colleges/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete college');
    }
    return response.json();
  },
  
  bulkDeleteColleges: async (codes) => {
    const response = await fetch(`${API_URL}/colleges/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ codes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete colleges');
    }
    return response.json();
  },

  // Programs
  getPrograms: async (search = '', collegeCode = '', page = 1, limit = 10, sortConfig = null) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (collegeCode) params.append('college_code', collegeCode);
    if (page) params.append('page', page);
    if (limit) params.append('per_page', limit);
    if (sortConfig) {
      params.append('sort_by', sortConfig.key);
      params.append('sort_order', sortConfig.direction);
    }
    
    const response = await fetch(`${API_URL}/programs?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch programs');
    }
    return response.json();
  },
  
  createProgram: async (data) => {
    const response = await fetch(`${API_URL}/programs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create program');
    }
    return response.json();
  },
  
  updateProgram: async (code, data) => {
    const response = await fetch(`${API_URL}/programs/${code}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update program');
    }
    return response.json();
  },
  
  deleteProgram: async (code) => {
    const response = await fetch(`${API_URL}/programs/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete program');
    }
    return response.json();
  },
  
  bulkDeletePrograms: async (codes) => {
    const response = await fetch(`${API_URL}/programs/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ codes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete programs');
    }
    return response.json();
  },

  // Students
  getStudents: async (filters = {}, page = 1, limit = 10, sortConfig = null) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('per_page', limit);
    
    if (sortConfig) {
      params.append('sort_by', sortConfig.key);
      params.append('sort_order', sortConfig.direction);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${API_URL}/students?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch students');
    }
    return response.json();
  },
  
  createStudent: async (data) => {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create student');
    }
    return response.json();
  },
  
  updateStudent: async (id, data) => {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update student');
    }
    return response.json();
  },
  
  deleteStudent: async (id) => {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete student');
    }
    return response.json();
  },
  
  bulkDeleteStudents: async (ids) => {
    const response = await fetch(`${API_URL}/students/bulk-delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete students');
    }
    return response.json();
  },

  // Statistics
  getStatistics: async () => {
    console.log('getStatistics - headers:', getAuthHeaders());
    const response = await fetch(`${API_URL}/statistics`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch statistics');
    }
    return response.json();
  },

  // Storage
  uploadStudentPhoto: async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('student-photos')
      .upload(fileName, file);

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from('student-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  },
};