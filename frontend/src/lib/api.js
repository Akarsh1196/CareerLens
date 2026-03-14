const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  onboarding: `${API_URL}/api/onboarding`,
  report: (userId) => `${API_URL}/api/report/${userId}`,
  checkin: `${API_URL}/api/checkin`
};
