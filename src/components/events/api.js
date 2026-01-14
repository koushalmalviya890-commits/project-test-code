// import axios from "axios";

// // Get the base URL from environment variable and ensure it doesn't have a trailing slash
// const getBaseUrl = () => {
//   const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
//   return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
// };

// export const BASE_URL = getBaseUrl();
// export const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, // Include credentials for cross-origin requests if needed
// });

// api.interceptors.request.use(
//   (config) => {
    
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       console.error('API Error:', {
//         status: error.response.status,
//         data: error.response.data,
//         headers: error.response.headers,
//         config: error.config
//       });
//     } else if (error.request) {
//       // Request was made but no response received
//       console.error('API Request Error:', error.request);
//     } else {
//       // Something happened in setting up the request
//       console.error('API Setup Error:', error.message);
//     }
//     return Promise.reject(error);
//   }
// );