import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { buildUrl, enableMocking, isCallingMethodPublic, registerMock, setupInterceptors, type InterceptorState } from './helpers';
import { getRefreshToken, getToken, removeRefreshToken, removeToken, setRefreshToken, setToken } from './token';
import type { BaseServiceOptions, HttpMethod, RequestConfig, ServiceOverrides } from './types';

let sharedOptions: Partial<BaseServiceOptions> | null = null;

export const configureBaseService = (options: Pick<BaseServiceOptions, 'baseURL'> & Partial<BaseServiceOptions>) => {
  sharedOptions = options;
};

export class BaseService {
  protected api: AxiosInstance;
  private mock?: MockAdapter;
  private interceptorState: InterceptorState;
  private options: Required<BaseServiceOptions>;

  constructor(options: BaseServiceOptions) {
    if (!sharedOptions) throw new Error('configureBaseService() must be called first.');

    this.interceptorState = { isRefreshing: false, failedQueue: [] };

    this.options = {
      serviceName: '',
      version: '',
      useMock: false,
      mockDelay: 1000,
      isPublic: false,
      retryOnStatusCodes: [401],
      transformError: (err: AxiosError<any>) => err.response?.data ?? { message: err.message || 'Network error' },
      getAccessToken: () => getToken(options.tokenConfig),
      setAccessToken: (token) => setToken(token, options.tokenConfig),
      removeAccessToken: () => removeToken(options.tokenConfig),
      getRefreshToken: () => getRefreshToken(options.tokenConfig),
      setRefreshToken: (token) => setRefreshToken(token, options.tokenConfig),
      removeRefreshToken: () => removeRefreshToken(options.tokenConfig),
      logout: () => {
        if (typeof window !== 'undefined') window.location.href = '/login';
      },
      ...sharedOptions,
      ...options,
    } as Required<BaseServiceOptions>;

    this.api = axios.create({ baseURL: this.options.baseURL });

    if (this.options.useMock) this.mock = enableMocking(this.api, this.options.mockDelay);

    if (!this.options.isPublic) {
      setupInterceptors(this.api, {
        getAccessToken: this.options.getAccessToken,
        setAccessToken: this.options.setAccessToken,
        setRefreshToken: this.options.setRefreshToken,
        retryOnStatusCodes: this.options.retryOnStatusCodes,
        refreshToken: this.options.refreshToken,
        logout: this.options.logout,
      }, this.interceptorState);
    }
  }

  protected async request<T>(method: HttpMethod, config: RequestConfig<T>): Promise<T> {
    const { endpoint, params, data, version, isMock = false, mockData, mockStatus = 200, includeHeaders = false, isPublic = false, config: axiosConfig = {} } = config;
    const url = buildUrl(this.options.serviceName, version ?? this.options.version, endpoint);

    if ((isMock || this.options.useMock) && mockData !== undefined) {
      if (!this.mock) this.mock = enableMocking(this.api, this.options.mockDelay);
      registerMock(this.mock, method, url, mockData, mockStatus);
    }

    const finalIsPublic = isPublic || isCallingMethodPublic(this);
    const requestConfig: AxiosRequestConfig & { isPublic?: boolean } = { params, ...axiosConfig, isPublic: finalIsPublic };

    try {
      const response: AxiosResponse<T> = ['get', 'delete'].includes(method)
        ? await this.api[method](url, requestConfig)
        : await this.api[method](url, data ?? {}, requestConfig);

      return includeHeaders ? ({ ...response.data, headers: response.headers } as T) : response.data;
    } catch (error) {
      throw this.options.transformError(error as AxiosError<any>);
    }
  }

  get<T>(config: RequestConfig<T>) { return this.request<T>('get', config); }
  post<T>(config: RequestConfig<T>) { return this.request<T>('post', config); }
  put<T>(config: RequestConfig<T>) { return this.request<T>('put', config); }
  patch<T>(config: RequestConfig<T>) { return this.request<T>('patch', config); }
  delete<T>(config: RequestConfig<T>) { return this.request<T>('delete', config); }

  getAxiosInstance() { return this.api; }
  getConfig() { return this.options; }
}

export class ApiService extends BaseService {
  constructor(overrides: Partial<ServiceOverrides> = {}) {
    super(overrides as BaseServiceOptions);
  }
}
