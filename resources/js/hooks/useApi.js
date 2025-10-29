import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * Custom hook for fetching data
 * @param {string} key - Query key
 * @param {string} endpoint - API endpoint
 * @param {object} options - React Query options
 */
export const useFetch = (key, endpoint, options = {}) => {
  return useQuery({
    queryKey: [key],
    queryFn: () => api.get(endpoint),
    ...options,
  });
};

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} options - React Query options
 */
export const useMutate = (endpoint, method = 'post', options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api[method](endpoint, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};
