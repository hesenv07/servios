import { CookieManager } from 'everyday-helper';
import type { SingleTokenConfig, TokenConfig, TokenCookieOptions } from './types';

const DEFAULT_ACCESS_TOKEN_KEY = 'accessToken';
const DEFAULT_REFRESH_TOKEN_KEY = 'refreshToken';

const DEFAULT_COOKIE_OPTIONS: Required<TokenCookieOptions> = {
  path: '/',
  expires: 7,
  secure: true,
  httpOnly: false,
  sameSite: 'Strict',
};

const DEFAULT_REFRESH_COOKIE_OPTIONS: Required<TokenCookieOptions> = {
  path: '/',
  expires: 30,
  secure: true,
  httpOnly: false,
  sameSite: 'Strict',
};

let globalTokenConfig: Required<SingleTokenConfig> & { refreshToken?: Required<SingleTokenConfig> } = {
  storage: 'cookie',
  tokenKey: DEFAULT_ACCESS_TOKEN_KEY,
  cookieOptions: DEFAULT_COOKIE_OPTIONS,
  refreshToken: {
    storage: 'cookie',
    tokenKey: DEFAULT_REFRESH_TOKEN_KEY,
    cookieOptions: DEFAULT_REFRESH_COOKIE_OPTIONS,
  },
};

export const configureToken = (config: TokenConfig) => {
  globalTokenConfig = {
    tokenKey: config.tokenKey || DEFAULT_ACCESS_TOKEN_KEY,
    storage: config.storage || 'cookie',
    cookieOptions: { ...DEFAULT_COOKIE_OPTIONS, ...config.cookieOptions },
    refreshToken: config.refreshToken
      ? {
        tokenKey: config.refreshToken.tokenKey || DEFAULT_REFRESH_TOKEN_KEY,
        storage: config.refreshToken.storage || 'cookie',
        cookieOptions: { ...DEFAULT_REFRESH_COOKIE_OPTIONS, ...config.refreshToken.cookieOptions },
      }
      : {
        storage: 'cookie',
        tokenKey: DEFAULT_REFRESH_TOKEN_KEY,
        cookieOptions: DEFAULT_REFRESH_COOKIE_OPTIONS,
      },
  };
};

// SSR-safe storage functions
const setTokenInStorage = (token: string, storage: string, tokenKey: string, cookieOptions?: TokenCookieOptions) => {
  if (typeof window === 'undefined') return;
  switch (storage) {
    case 'localStorage':
      localStorage.setItem(tokenKey, token);
      break;
    case 'sessionStorage':
      sessionStorage.setItem(tokenKey, token);
      break;
    case 'cookie':
    default:
      CookieManager.set(tokenKey, token, { ...DEFAULT_COOKIE_OPTIONS, ...cookieOptions });
  }
};

const getTokenFromStorage = (storage: string, tokenKey: string): string | null => {
  if (typeof window === 'undefined') return null;
  switch (storage) {
    case 'localStorage':
      return localStorage.getItem(tokenKey) || null;
    case 'sessionStorage':
      return sessionStorage.getItem(tokenKey) || null;
    case 'cookie':
    default:
      return CookieManager.get(tokenKey);
  }
};

const removeTokenFromStorage = (storage: string, tokenKey: string, cookieOptions?: TokenCookieOptions) => {
  if (typeof window === 'undefined') return;
  switch (storage) {
    case 'localStorage':
      localStorage.removeItem(tokenKey);
      break;
    case 'sessionStorage':
      sessionStorage.removeItem(tokenKey);
      break;
    case 'cookie':
    default:
      CookieManager.remove(tokenKey, { path: cookieOptions?.path || '/' });
  }
};

export const setToken = (token: string, config?: TokenConfig) => {
  const tokenConfig = config || globalTokenConfig;
  setTokenInStorage(token, tokenConfig.storage!, tokenConfig.tokenKey!, tokenConfig.cookieOptions);
};

export const getToken = (config?: TokenConfig) => {
  const tokenConfig = config || globalTokenConfig;
  return getTokenFromStorage(tokenConfig.storage!, tokenConfig.tokenKey!);
};

export const removeToken = (config?: TokenConfig) => {
  const tokenConfig = config || globalTokenConfig;
  removeTokenFromStorage(tokenConfig.storage!, tokenConfig.tokenKey!, tokenConfig.cookieOptions);
};

export const setRefreshToken = (token: string, config?: TokenConfig) => {
  const refreshConfig = config?.refreshToken || globalTokenConfig.refreshToken;
  if (!refreshConfig) return;
  setTokenInStorage(token, refreshConfig.storage!, refreshConfig.tokenKey!, refreshConfig.cookieOptions);
};

export const getRefreshToken = (config?: TokenConfig) => {
  const refreshConfig = config?.refreshToken || globalTokenConfig.refreshToken;
  if (!refreshConfig) return null;
  return getTokenFromStorage(refreshConfig.storage!, refreshConfig.tokenKey!);
};

export const removeRefreshToken = (config?: TokenConfig) => {
  const refreshConfig = config?.refreshToken || globalTokenConfig.refreshToken;
  if (!refreshConfig) return;
  removeTokenFromStorage(refreshConfig.storage!, refreshConfig.tokenKey!, refreshConfig.cookieOptions);
};
