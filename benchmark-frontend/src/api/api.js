import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitShopify = (payload) => api.post('/shopify', payload);
export const submitShopifyBatch = (payload) => api.post('/shopify/batch', payload);
export const submitManual = (payload) => api.post('/manual', payload);
export const getMetrics = () => api.get('/metrics');
export const getReport = () => api.get('/report');
