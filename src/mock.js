// Mock Axios Interceptor for CAUSA
import axios from 'axios';
import { mockAlerts, mockGraph, mockRCA } from './mockData';

console.log('CAUSA Standalone Mode: Initializing axios mock interceptors...');

// Configure axios request interceptor to return mock responses locally
axios.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    console.log(`[CAUSA Mock] Intercepted request to: ${url}`);

    if (url.includes('/v1/alerts')) {
      console.log('[CAUSA Mock] Resolving /v1/alerts with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockAlerts,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/graph')) {
      console.log('[CAUSA Mock] Resolving /v1/graph with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockGraph,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    } else if (url.includes('/v1/rca')) {
      console.log('[CAUSA Mock] Resolving /v1/rca with mock data');
      config.adapter = () => {
        return Promise.resolve({
          data: mockRCA,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
