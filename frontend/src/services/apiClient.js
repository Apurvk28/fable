/**
 * Fable API Client
 * Built on native fetch with credentialed CORS and standard headers.
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

export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Fable-Client': 'web',
    'X-Requested-With': 'XMLHttpRequest',
  };

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
