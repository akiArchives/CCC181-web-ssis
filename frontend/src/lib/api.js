const API_URL = 'http://localhost:5000/api';

export const api = {
  // Colleges
  getColleges: async (search = '') => {
    const response = await fetch(`${API_URL}/colleges?search=${search}`);
    return response.json();
  },
  
  createCollege: async (data) => {
    const response = await fetch(`${API_URL}/colleges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete colleges');
    }
    return response.json();
  },

  // Programs
  getPrograms: async (search = '', collegeCode = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (collegeCode) params.append('college_code', collegeCode);
    
    const response = await fetch(`${API_URL}/programs?${params}`);
    return response.json();
  },
  
  createProgram: async (data) => {
    const response = await fetch(`${API_URL}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete programs');
    }
    return response.json();
  },

  // Students
  getStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${API_URL}/students?${params}`);
    return response.json();
  },
  
  createStudent: async (data) => {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_URL}/statistics`);
    return response.json();
  },
};