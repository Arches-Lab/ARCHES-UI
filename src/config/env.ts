// Environment configuration
export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  },
  environment: import.meta.env.VITE_ENV || 'development',
  contactListId: import.meta.env.VITE_CONTACT_LIST_ID || 'dc882cc8-c0a5-464a-9297-63205b31e51f',
};

export default config; 