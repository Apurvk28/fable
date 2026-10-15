/**
 * Fable API Client
 * Built on native fetch with credentialed CORS, HMAC-signed CSRF protection, and standard headers.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Utility to extract a cookie value by name from document.cookie
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Fable-Client': 'web',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Attach X-XSRF-TOKEN on mutating requests
  if (mutatingMethods.includes(method)) {
    let csrfToken = getCookie('XSRF-TOKEN');

    // If no CSRF cookie exists yet in the browser, initialize it before submitting
    if (!csrfToken && endpoint !== '/api/v1/auth/csrf-token') {
      try {
        const csrfRes = await fetch(`${API_BASE_URL}/api/v1/auth/csrf-token`, {
          credentials: 'include',
        });
        if (csrfRes.ok) {
          const csrfJson = await csrfRes.json();
          csrfToken = csrfJson?.csrfToken || getCookie('XSRF-TOKEN');
        }
      } catch (e) {
        console.warn('Failed to pre-fetch CSRF token:', e);
      }
    }

    if (csrfToken) {
      defaultHeaders['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  const config = {
    ...options,
    credentials: 'include', // Mandates cookie exchange
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (isJson && data?.error?.message) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors, CORS rejection, or offline
    throw new ApiError(
      error.message || 'Unable to connect to backend server. Is it running?',
      0,
      null
    );
  }
};

export const checkHealth = () => apiClient('/health');

// Phase 2: Authentication API Methods
export const authApi = {
  getCsrfToken: () => apiClient('/api/v1/auth/csrf-token'),
  register: (userData) =>
    apiClient('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    apiClient('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient('/api/v1/auth/logout', {
      method: 'POST',
    }),
  getMe: () => apiClient('/api/v1/auth/me'),
};

// Phase 3: Agent Management API Methods
export const agentApi = {
  getAgents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.tool) query.set('tool', params.tool);
    if (params.sort) query.set('sort', params.sort);
    const queryString = query.toString();
    return apiClient(`/api/v1/agents${queryString ? `?${queryString}` : ''}`);
  },
  getAgent: (id) => apiClient(`/api/v1/agents/${id}`),
  createAgent: (agentData) =>
    apiClient('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    }),
  updateAgent: (id, agentData) =>
    apiClient(`/api/v1/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(agentData),
    }),
  deleteAgent: (id) =>
    apiClient(`/api/v1/agents/${id}`, {
      method: 'DELETE',
    }),
  duplicateAgent: (id) =>
    apiClient(`/api/v1/agents/${id}/duplicate`, {
      method: 'POST',
    }),
  generateConfig: (data) =>
    apiClient('/api/v1/agents/generate-config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSupportedModels: () => apiClient('/api/v1/agents/models'),
  runTask: (id, input) =>
    apiClient(`/api/v1/agents/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    }),
  chat: (id, message, history = []) =>
    apiClient(`/api/v1/agents/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
  getRecentExecutions: (id) => apiClient(`/api/v1/agents/${id}/executions`),
};

// Phase 6 & 7: Execution API Methods
export const executionApi = {
  getExecutions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.agentId && params.agentId !== 'all') query.set('agentId', params.agentId);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.mode && params.mode !== 'all') query.set('mode', params.mode);
    if (params.sort) query.set('sort', params.sort);
    if (params.q && params.q.trim()) query.set('q', params.q.trim());
    const queryString = query.toString();
    return apiClient(`/api/v1/executions${queryString ? `?${queryString}` : ''}`);
  },
  getExecution: (id) => apiClient(`/api/v1/executions/${id}`),
};


