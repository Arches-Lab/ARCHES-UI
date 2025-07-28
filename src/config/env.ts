// Environment configuration
export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  },
  environment: import.meta.env.VITE_ENV || 'development',
};

export default config; 