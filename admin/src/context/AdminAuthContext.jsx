import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      API.get('/auth/me')
        .then((res) => {
          if (res.data.role !== 'admin') {
            localStorage.removeItem('adminToken');
          } else {
            setAdmin(res.data);
          }
        })
        .catch(() => localStorage.removeItem('adminToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (data, token) => {
    localStorage.setItem('adminToken', token);
    setAdmin(data);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
