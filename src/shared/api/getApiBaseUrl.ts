// Helper function to get the API base URL
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};
