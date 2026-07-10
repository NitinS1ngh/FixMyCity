const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Simple storage service to avoid circular dependency
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const fetchWithError = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const isFormData = options.body instanceof FormData;
  if (isFormData) {
    delete headers['Content-Type']; // Let the browser set the boundary
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
      localStorage.removeItem('user');
      // Redirect to login if window exists
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const api = {
  get: (endpoint, options = {}) => fetchWithError(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => fetchWithError(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: (endpoint, body, options = {}) => fetchWithError(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  patch: (endpoint, body, options = {}) => fetchWithError(endpoint, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: (endpoint, options = {}) => fetchWithError(endpoint, { method: 'DELETE', ...options }),
};

export default api;
