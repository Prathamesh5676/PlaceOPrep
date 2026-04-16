import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', res.data.token);
  if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

export async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function refreshUserData() {
  const res = await api.get('/auth/me');
  if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data.user;
}
