import api from './api';

const login = async (email, password) => {
  const response = await api.post('/api/detection/auth/login/', { email, password });
  
  const token = response.data.token || response.data.key;
  const adminFlag = response.data.is_admin ?? response.data.isAdmin ?? false;

  if (token) {
    localStorage.setItem('dermaAI_token', token);
    localStorage.setItem('dermaAI_isAdmin', String(!!adminFlag));
  }
  return response.data;
};

const register = async (fullName, email, phone, password) => {
  const response = await api.post('/api/detection/auth/register/', {
    name: fullName,
    email: email,
    phone: phone,
    password: password,
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem('dermaAI_token');
  localStorage.removeItem('dermaAI_isAdmin');
  window.location.href = '/login';
};

const isAuthenticated = () => {
  return !!localStorage.getItem('dermaAI_token');
};

const authService = {
  login,
  register,
  logout,
  isAuthenticated,
};

export default authService;
