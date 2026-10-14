import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, authState } from '../api';

const AuthContext = createContext(null);

export const SEED_USERS = [
  { email: 'spdysp@demo.in', name: 'SP A. Kashyap (IPS)', role: 'sp_dysp', label: 'Superintendent of Police (SP / DySP)' },
  { email: 'cybercell@demo.in', name: 'Insp. P. Nayak (Cyber)', role: 'cyber_cell', label: 'Cyber Crime Cell Inspector' },
  { email: 'headconstable@demo.in', name: 'HC S. Deshmukh', role: 'head_constable', label: 'Head Constable (Investigator)' },
  { email: 'constable@demo.in', name: 'Constable R. Verma', role: 'constable', label: 'Field Constable' },
  { email: 'auditor@demo.in', name: 'Auditor M. Raman', role: 'auditor', label: 'Judicial / Forensic Auditor' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authState.getUser() || {
    email: 'spdysp@demo.in',
    name: 'SP A. Kashyap (IPS)',
    role: 'sp_dysp'
  });
  const [token, setToken] = useState(() => authState.getToken() || 'token_sp_dysp_init');
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (!authState.getToken()) {
      authState.setAuth('token_sp_dysp_init', {
        email: 'spdysp@demo.in',
        name: 'SP A. Kashyap (IPS)',
        role: 'sp_dysp'
      });
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    setToken(res.token);
    setUser(res.user);
    authState.setAuth(res.token, res.user);
    return res.user;
  };

  const switchRoleDirectly = (targetEmail) => {
    const target = SEED_USERS.find(u => u.email === targetEmail) || SEED_USERS[0];
    const newToken = `token_${target.role}_${Date.now()}`;
    const newUser = { email: target.email, name: target.name, role: target.role };
    setToken(newToken);
    setUser(newUser);
    authState.setAuth(newToken, newUser);
  };

  const logout = () => {
    authState.clearAuth();
    setUser(null);
    setToken(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRoleDirectly, hasRole, debugMode, setDebugMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
