import axios from "axios";

export const config = () => {
    return {headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('token'))}` }}
}
export default axios.create({
    //baseURL: 'http://192.168.1.102:3001',
    headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('token'))}` }
});

axios.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('token');
  
      if (token) {
        config.headers.Authorization = `Bearer ${JSON.parse(sessionStorage.getItem('token'))}`;
      }
  
      return config;
    },
  );