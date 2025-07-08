import API from './index';

export async function submitVerification(data: { driverLicenseNumber: string; vehicleRegistrationNumber: string }) {
  const res = await API.post('/agent/verify', data);
  return res.data.data;
}

export async function fetchAgentProfile() {
  const res = await API.get('/agent/profile');
  return res.data.data;
} 