import axios from 'axios';

// Single source of truth for base URL - proxied by Vite in dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from sessionStorage or memory
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sakshi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authState = {
  getToken: () => sessionStorage.getItem('sakshi_token'),
  getUser: () => {
    try {
      const u = sessionStorage.getItem('sakshi_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token, user) => {
    if (token) sessionStorage.setItem('sakshi_token', token);
    if (user) sessionStorage.setItem('sakshi_user', JSON.stringify(user));
  },
  clearAuth: () => {
    sessionStorage.removeItem('sakshi_token');
    sessionStorage.removeItem('sakshi_user');
  }
};

// API Services
export const loginApi = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
};

export const getCaseApi = async () => {
  const res = await apiClient.get('/case');
  return res.data;
};

export const getGraphApi = async (until = null) => {
  const url = until ? `/graph?until=${encodeURIComponent(until)}` : '/graph';
  const res = await apiClient.get(url);
  return res.data;
};

export const getEntityApi = async (id) => {
  const res = await apiClient.get(`/entity/${encodeURIComponent(id)}`);
  return res.data;
};

export const explainEdgeApi = async (source, target) => {
  const res = await apiClient.get(`/edge/${encodeURIComponent(source)}/${encodeURIComponent(target)}/explain`);
  return res.data;
};

export const getMergeQueueApi = async () => {
  const res = await apiClient.get('/merge-queue');
  return res.data;
};

export const approveMergeApi = async (id) => {
  const res = await apiClient.post(`/merge/${encodeURIComponent(id)}/approve`);
  return res.data;
};

export const rejectMergeApi = async (id) => {
  const res = await apiClient.post(`/merge/${encodeURIComponent(id)}/reject`);
  return res.data;
};

export const getAlertsApi = async () => {
  const res = await apiClient.get('/alerts');
  return res.data;
};

export const getGoldenHourApi = async () => {
  const res = await apiClient.get('/golden-hour');
  return res.data;
};

export const simulateRemoveNodeApi = async (nodeId) => {
  const res = await apiClient.post('/simulate/remove-node', { node_id: nodeId });
  return res.data;
};

export const getTimelineRangeApi = async () => {
  const res = await apiClient.get('/timeline-range');
  return res.data;
};

export const askCopilotApi = async (question) => {
  const res = await apiClient.post('/copilot', { question });
  return res.data;
};

export const generateReportApi = async () => {
  const res = await apiClient.post('/report');
  return res.data;
};

export const emailReportApi = async (reportId) => {
  const res = await apiClient.post('/report/email', { report_id: reportId });
  return res.data;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const detail = error.response.data?.detail || 'Access Denied: Action not permitted for your current role.';
      window.dispatchEvent(new CustomEvent('sakshi-rbac-denied', { detail }));
    }
    return Promise.reject(error);
  }
);

export const getLedgerApi = async () => {
  const res = await apiClient.get('/ledger');
  return res.data;
};

export const verifyLedgerApi = async () => {
  const res = await apiClient.get('/verify');
  return res.data;
};

export const debugTamperApi = async () => {
  const res = await apiClient.post('/debug/tamper');
  return res.data;
};

export const debugResetTamperApi = async () => {
  const res = await apiClient.post('/debug/reset-tamper');
  return res.data;
};

export const debugResetApi = async () => {
  const res = await apiClient.post('/debug/reset');
  return res.data;
};

export const getValidationApi = async () => {
  const res = await apiClient.get('/validation');
  return res.data;
};

export const unmaskEntityApi = async (id) => {
  const res = await apiClient.post(`/entity/${encodeURIComponent(id)}/unmask`);
  return res.data;
};

export const reloadCaseApi = async () => {
  const res = await apiClient.post('/case/reload');
  return res.data;
};

export default apiClient;
