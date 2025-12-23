import MockAdapter from 'axios-mock-adapter';

import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

import { isPublicMethod } from './decorators';

import type { HttpMethod } from './types';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  isPublic?: boolean;
}

export function buildUrl(
  serviceName: string | undefined,
  version: string | undefined,
  endpoint: string,
  prefix?: string,
): string {
  const parts: string[] = [];

  if (prefix) parts.push(prefix);
  if (serviceName) parts.push(serviceName);
  if (version) parts.push(version);

  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  if (cleanEndpoint) parts.push(cleanEndpoint);

  return parts.join('/');
}

export function getCallingMethodName(): string | null {
  try {
    const stack = new Error().stack;
    if (!stack) return null;

    const lines = stack.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (
        line.includes('getCallingMethodName') ||
        line.includes('isCallingMethodPublic') ||
        line.includes('request') ||
        line.includes('.get ') ||
        line.includes('.post ') ||
        line.includes('.put ') ||
        line.includes('.patch ') ||
        line.includes('.delete ')
      ) {
        continue;
      }

      const match = line.match(/at (?:\w+\.)?(\w+)/);
      if (match && match[1] && match[1] !== 'anonymous') {
        return match[1];
      }
    }
  } catch (error) {
    return null;
  }

  return null;
}

export function isCallingMethodPublic(instance: any): boolean {
  const methodName = getCallingMethodName();
  if (!methodName) return false;

  return isPublicMethod(instance, methodName);
}

export function registerMock<T>(
  mock: MockAdapter | undefined,
  method: HttpMethod,
  url: string,
  data: T | ((config: AxiosRequestConfig) => { data: T; status?: number }),
  status = 200,
): void {
  if (!mock) return;

  const methodName = `on${method.charAt(0).toUpperCase() + method.slice(1)}` as
    | 'onGet'
    | 'onPost'
    | 'onPut'
    | 'onPatch'
    | 'onDelete';

  (mock[methodName] as any)(url).reply((config: AxiosRequestConfig) => {
    if (typeof data == 'function') {
      const r = (data as Function)(config);
      return [r.status ?? 200, r.data];
    }
    return [status, data];

  })
}

export function enableMocking(api: AxiosInstance, mockDelay: number): MockAdapter {
  return new MockAdapter(api, {
    delayResponse: mockDelay,
    onNoMatch: 'passthrough',
  });
}

function processQueueInternal(
  failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: CustomAxiosRequestConfig;
  }>,
  api: AxiosInstance,
  error: any,
  token?: string,
): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      resolve(api(config));
    }
  });
}

export interface InterceptorState {
  isRefreshing: boolean;
  failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: CustomAxiosRequestConfig;
  }>;
}

export function setupInterceptors(
  api: AxiosInstance,
  options: {
    getAccessToken: () => string | null;
    setAccessToken: (token: string) => void;
    setRefreshToken?: (token: string) => void;
    retryOnStatusCodes: number[];
    refreshToken?: () => Promise<{ accessToken: string; refreshToken?: string }>;
    logout: () => void;
  },
  state: InterceptorState,
): void {
  api.interceptors.request.use((config) => {
    if ((config as CustomAxiosRequestConfig).isPublic) {
      return config;
    }

    const token = options.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const config = error.config as CustomAxiosRequestConfig;
      if (!config) return Promise.reject(error);

      const shouldRetry =
        error.response?.status &&
        options.retryOnStatusCodes.includes(error.response.status) &&
        !config._retry;

      if (shouldRetry && options.refreshToken) {
        config._retry = true;

        return new Promise((resolve, reject) => {
          state.failedQueue.push({ resolve, reject, config });

          if (!state.isRefreshing) {
            state.isRefreshing = true;
            options.refreshToken!()
              .then(({ accessToken, refreshToken }) => {
                options.setAccessToken(accessToken);
                if (refreshToken && options.setRefreshToken) {
                  options.setRefreshToken(refreshToken);
                }
                processQueueInternal(state.failedQueue, api, null, accessToken);
                state.failedQueue = [];
              })
              .catch((err) => {
                processQueueInternal(state.failedQueue, api, err);
                state.failedQueue = [];
                options.logout();
              })
              .finally(() => (state.isRefreshing = false));
          }
        });
      }
      return Promise.reject(error);
    },
  );
}
