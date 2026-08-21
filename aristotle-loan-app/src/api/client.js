import axios from 'axios';

const API = axios.create({
  baseURL: 'https://aristotle-backend-3n4o.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;