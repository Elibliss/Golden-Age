import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE || '';

export const api = axios.create({
  baseURL,
  timeout: 15000
});

export default api;
