import { isAxiosError } from 'axios';

import type { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

import { createAxiosInstance } from './axios-instance';

import type { ApiServiceConfig } from './types';

export class ApiService {
  protected api: AxiosInstance;
  protected config: ApiServiceConfig;

  constructor(config: ApiServiceConfig) {
    this.config = config;
    this.api = createAxiosInstance(config);
  }

  private async request<T>(endpoint: string, config: AxiosRequestConfig): Promise<T> {
    try {
      const requestConfig: AxiosRequestConfig = {
        ...config,
        url: endpoint,
      };
      const response: AxiosResponse<T> = await this.api.request<T>(requestConfig);

      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        throw new Error(axiosError.response?.data?.message ?? `API Error: ${axiosError.message}`);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  protected get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
    });
  }

  protected post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      data: body,
    });
  }

  protected put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      data: body,
    });
  }

  protected patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      data: body,
    });
  }

  protected delete<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      params,
    });
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }

  public getConfig(): ApiServiceConfig {
    return this.config;
  }
}
