import API from './index';

export async function submitVerification(data: { driverLicenseNumber: string; vehicleRegistrationNumber: string }) {
  const res = await API.post('/agent/verify', data);
  return res.data.data;
}

export async function fetchAgentProfile() {
  const res = await API.get('/agent/profile');
  return res.data.data;
}

// Robustly set agent online/offline status
export async function setAgentOnlineStatus(isOnline: boolean) {
  try {
    const res = await API.post('/agent/online', { isOnline });
    return res.data.data;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as { response?: unknown }).response === 'object' &&
      (err as { response?: { data?: { error?: string } } }).response?.data?.error
    ) {
      return Promise.reject((err as { response: { data: { error: string } } }).response.data.error);
    }
    return Promise.reject((err as Error).message || 'Failed to update online status');
  }
} 