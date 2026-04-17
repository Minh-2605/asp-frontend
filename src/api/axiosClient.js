import axios from 'axios';

const axiosClient = axios.create({
  
  baseURL: 'https://asp-net-11.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;