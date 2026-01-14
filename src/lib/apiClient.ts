import axios from "axios";

// Get the base URL from environment variable and ensure it doesn't have a trailing slash
const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cleanUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Debug logging
 // console.log('Environment API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
 // console.log('Clean Base URL:', cleanUrl);
  
  return cleanUrl;
};

export const BASE_URL = getBaseUrl();

// Create axios instance for external API calls
export const externalApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
externalApi.interceptors.request.use(
  (config) => {
   // console.log('Making API request:', {
    //   method: config.method?.toUpperCase(),
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: `${config.baseURL}${config.url}`
    // });
    
    // Only try to get token on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
externalApi.interceptors.response.use(
  (response) => {
   // console.log('API Response success:', {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data
    // });
    return response;
  },
  (error) => {
    console.error('API Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      console.error('Server Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: error.config
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received:', error.request);
    } else {
      // Something else happened
      console.error('Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to make API calls with better error handling
export const apiCall = {
  get: async (url: string) => {
    try {
      return await externalApi.get(url);
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  post: async (url: string, data: any) => {
    try {
     // console.log('POST request data:', data);
      return await externalApi.post(url, data);
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async (url: string, data: any) => {
    try {
      return await externalApi.put(url, data);
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url: string) => {
    try {
      return await externalApi.delete(url);
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
};

export default externalApi;