import axios from 'axios';
// import jwt from 'jsonwebtoken'
// Create an axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3002/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('auth');
    // const user = jwt

    // If the token exists, set it in the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
