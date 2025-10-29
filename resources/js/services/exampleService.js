import api from '../utils/api';

/**
 * Example service for API calls
 * This demonstrates the service pattern for organizing API endpoints
 */

export const exampleService = {
  // GET request example
  getAll: () => api.get('/items'),

  // GET by ID example
  getById: (id) => api.get(`/items/${id}`),

  // POST request example
  create: (data) => api.post('/items', data),

  // PUT request example
  update: (id, data) => api.put(`/items/${id}`, data),

  // DELETE request example
  delete: (id) => api.delete(`/items/${id}`),
};

export default exampleService;
