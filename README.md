# Servios

> Zero-config, fully overridable, production-ready HTTP client for modern applications

Servios is a lightweight foundational library that provides essential building blocks for modern applications, including core utilities, API abstractions, integration providers, caching mechanisms, and shared logic. It is designed to centralize common functionality and promote clean, maintainable, and reusable code across multiple projects.

## ✨ Features

- 🚀 **Zero-repetition** - Configure once, use everywhere
- 🎯 **Fully overridable** - Override any option per service (serviceName, version, mock, etc.)
- 🔄 **Auto token refresh** - Automatic 401 handling with token refresh & request retry
- 🎭 **Mock support** - Built-in mock adapter for development & testing
- 📦 **Type-safe** - Full TypeScript support with excellent IDE autocomplete
- 🔧 **Flexible** - 3 ways to create services (class extend, factory, direct)
- 🌐 **Smart URL builder** - Auto-generates URLs with service name + version
- 💾 **Token management** - Cookie, localStorage, or sessionStorage support

## 📦 Installation

```bash
npm install servios
# or
yarn add servios
# or
pnpm add servios
```

## 🚀 Quick Start

### Step 1: Configure Once (Global Setup)

Create a config file and call `configureBaseService()` once at app initialization:

```typescript
// src/api/config.ts
import { configureBaseService } from 'servios';

configureBaseService({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',

  // Token management
  getAccessToken: () => localStorage.getItem('accessToken'),
  setAccessToken: (token) => localStorage.setItem('accessToken', token),
  removeAccessToken: () => localStorage.removeItem('accessToken'),

  // Refresh token on 401
  async refreshToken() {
    const response = await fetch('/auth/refresh', {
      credentials: 'include',
    });
    const data = await response.json();
    return { accessToken: data.accessToken };
  },

  // Logout handler
  logout: () => {
    window.location.href = '/login';
  },
});
```

### Step 2: Create Services (3 Ways)

#### ✅ Way 1: Extend ApiService (Recommended)

```typescript
// src/api/services/UserService.ts
import { ApiService } from 'servios';

export class UserService extends ApiService {
  constructor() {
    super({
      serviceName: 'users',
      version: 'v2', // optional, default: 'v1'
      useMock: import.meta.env.DEV, // optional
      mockDelay: 1000, // optional, default: 1000ms
    });
  }

  getMe() {
    return this.get<{ user: User }>({ endpoint: 'me' });
  }

  updateProfile(data: UpdateProfileDto) {
    return this.patch<{ user: User }>({
      endpoint: 'profile',
      data,
    });
  }

  getAllUsers(params?: { page?: number; limit?: number }) {
    return this.get<{ users: User[] }>({
      endpoint: 'list',
      params,
    });
  }
}

export default new UserService();
```

#### ✅ Way 2: Factory Function (One-liner)

```typescript
// src/api/services/product.ts
import { createService } from 'servios';

export const productApi = createService({
  serviceName: 'products',
  version: 'v3',
  useMock: false,
});

// Use directly
const products = await productApi.get({ endpoint: 'list' });
```

#### ✅ Way 3: Direct BaseService

```typescript
import { BaseService } from 'servios';

const customApi = new BaseService({
  baseURL: 'https://custom-api.com',
  serviceName: 'custom',
  getAccessToken: () => null,
  setAccessToken: () => {},
  removeAccessToken: () => {},
  refreshToken: async () => ({ accessToken: '' }),
  logout: () => {},
});
```

### Step 3: Use in Components

```typescript
import userService from '@/api/services/UserService';

// In your React component, Vue component, etc.
async function loadUserProfile() {
  try {
    const { user } = await userService.getMe();
    console.log(user);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}
```

---

## 📖 Full API Reference

### Configuration Options

#### BaseServiceOptions (Global Config)

When calling `configureBaseService()`, only `baseURL` is required. All other options are optional with sensible defaults:

```typescript
interface BaseServiceOptions {
  // ✅ REQUIRED
  baseURL: string;

  // Service identification
  serviceName?: string;              // Default: 'api'
  version?: string;                  // Default: 'v1'

  // Token management (auto-handled if not provided)
  getAccessToken?: () => string | null;
  setAccessToken?: (token: string) => void;
  removeAccessToken?: () => void;
  getRefreshToken?: () => string | null;
  setRefreshToken?: (token: string) => void;
  removeRefreshToken?: () => void;

  // Refresh token handler
  refreshToken?: () => Promise<{
    accessToken: string;
    refreshToken?: string;
  }>;
  logout?: () => void;               // Default: redirect to /login

  // Retry configuration
  retryOnStatusCodes?: number[];     // Default: [401]

  // Mock configuration
  useMock?: boolean;                 // Default: false
  mockDelay?: number;                // Default: 1000ms

  // Error transformation
  transformError?: (error: AxiosError) => any;

  // Token storage configuration
  tokenConfig?: TokenConfig;
}
```

#### TokenConfig

Configure how tokens are stored (access and refresh tokens separately):

```typescript
interface TokenConfig {
  // Access token configuration
  tokenKey?: string;                 // Default: 'accessToken'
  storage?: 'cookie' | 'localStorage' | 'sessionStorage'; // Default: 'cookie'
  cookieOptions?: {
    path?: string;                   // Default: '/'
    secure?: boolean;                // Default: true
    expires?: number;                // Default: 7 (days)
    sameSite?: 'Strict' | 'Lax' | 'None'; // Default: 'Strict'
  };

  // Refresh token configuration (separate storage)
  refreshToken?: {
    tokenKey?: string;               // Default: 'refreshToken'
    storage?: 'cookie' | 'localStorage' | 'sessionStorage'; // Default: 'cookie'
    cookieOptions?: {
      path?: string;                 // Default: '/'
      secure?: boolean;              // Default: true
      expires?: number;              // Default: 30 (days)
      sameSite?: 'Strict' | 'Lax' | 'None'; // Default: 'Strict'
    };
  };
}
```

#### ServiceOverrides (Per-Service Config)

When creating individual services, you can override these options:

```typescript
type ServiceOverrides = {
  serviceName?: string;
  version?: string;
  useMock?: boolean;
  mockDelay?: number;
  transformError?: (error: AxiosError) => any;
  retryOnStatusCodes?: number[];
};
```

---

## 🔐 Token Management

### Default Behavior (Zero Config)

If you don't provide token handlers, Servios automatically uses built-in utilities with these defaults:

- **Access Token**: Stored in cookie as `accessToken`, secure, 7 days expiry
- **Refresh Token**: Stored in cookie as `refreshToken`, secure, 30 days expiry

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',
  // Token handling is automatic!
});
```

### Custom Token Storage

#### Option 1: Use Built-in Token Utilities with Custom Config

```typescript
import { configureBaseService, configureToken } from 'servios';

// Configure token storage globally
configureToken({
  // Access token config
  tokenKey: 'myAccessToken',
  storage: 'localStorage',

  // Refresh token config (separate storage)
  refreshToken: {
    tokenKey: 'myRefreshToken',
    storage: 'cookie',
    cookieOptions: {
      secure: true,
      sameSite: 'Strict',
      expires: 30,
    },
  },
});

configureBaseService({
  baseURL: 'https://api.example.com',
  // Will use the configured token settings
});
```

#### Option 2: Provide Custom Token Handlers

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',

  // Custom access token handlers
  getAccessToken: () => localStorage.getItem('custom_token'),
  setAccessToken: (token) => localStorage.setItem('custom_token', token),
  removeAccessToken: () => localStorage.removeItem('custom_token'),

  // Custom refresh token handlers
  getRefreshToken: () => sessionStorage.getItem('refresh'),
  setRefreshToken: (token) => sessionStorage.setItem('refresh', token),
  removeRefreshToken: () => sessionStorage.removeItem('refresh'),
});
```

### Refresh Token Flow

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',

  // Custom refresh logic
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken, // optional: new refresh token
    };
  },

  // Called when refresh fails
  logout: () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  },
});
```

### Token Utilities

Use these utilities anywhere in your app:

```typescript
import {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  configureToken,
} from 'servios';

// Access token
setToken('eyJhbGc...');
const token = getToken();
removeToken();

// Refresh token
setRefreshToken('refresh_xyz...');
const refresh = getRefreshToken();
removeRefreshToken();

// Configure storage
configureToken({
  storage: 'localStorage',
  tokenKey: 'myToken',
  refreshToken: {
    storage: 'cookie',
    tokenKey: 'myRefresh',
    cookieOptions: {
      secure: true,
      httpOnly: false, // Cannot be set from client-side JS
      expires: 30,
    },
  },
});
```

---

## 🔄 Retry Configuration

### Default Retry Behavior

By default, Servios retries requests on **401 Unauthorized** status:

```typescript
// Default: retryOnStatusCodes: [401]
```

### Custom Retry Status Codes

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',
  retryOnStatusCodes: [401, 403], // Retry on both 401 and 403
});

// Or override per service
class UserService extends ApiService {
  constructor() {
    super({
      serviceName: 'users',
      retryOnStatusCodes: [401, 503], // Also retry on 503 Service Unavailable
    });
  }
}
```

### Disable Retry

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',
  retryOnStatusCodes: [], // No auto-retry
});
```

---

## 🎭 Mock Support

### Enable Mock Globally

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',
  useMock: import.meta.env.DEV, // Enable in development
  mockDelay: 1500, // Simulate 1.5s network delay
});
```

### Enable Mock Per Service

```typescript
class PaymentService extends ApiService {
  constructor() {
    super({
      serviceName: 'payments',
      useMock: true,
      mockDelay: 500,
    });
  }

  createPayment(data: PaymentDto) {
    return this.post({
      endpoint: 'create',
      data,
      // Mock this specific request
      isMock: true,
      mockData: {
        id: 'pay_123',
        status: 'success',
        amount: data.amount,
      },
      mockStatus: 201,
    });
  }
}
```

### Mock Specific Requests

```typescript
const response = await userService.get({
  endpoint: 'me',
  isMock: true,
  mockData: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
  },
  mockStatus: 200,
});
```

---

## 🌐 URL Building

Servios automatically builds URLs from `baseURL`, `serviceName`, `version`, and `endpoint`:

```typescript
// Configuration
configureBaseService({
  baseURL: 'https://api.example.com',
});

class UserService extends ApiService {
  constructor() {
    super({
      serviceName: 'users',
      version: 'v2',
    });
  }

  getProfile() {
    return this.get({ endpoint: 'profile' });
    // Final URL: https://api.example.com/users/v2/profile
  }

  getOrders() {
    return this.get({
      endpoint: 'orders',
      version: 'v3', // Override version per request
    });
    // Final URL: https://api.example.com/users/v3/orders
  }
}
```

### URL Structure

```
{baseURL}/{serviceName}/{version}/{endpoint}
```

Example:
- `baseURL`: `https://api.example.com`
- `serviceName`: `users`
- `version`: `v2`
- `endpoint`: `profile/settings`

**Result**: `https://api.example.com/users/v2/profile/settings`

---

## 🛠️ Advanced Features

### Custom Error Transformation

```typescript
configureBaseService({
  baseURL: 'https://api.example.com',

  transformError: (error) => {
    // Custom error shape
    return {
      success: false,
      message: error.response?.data?.message || 'Something went wrong',
      code: error.response?.data?.code,
      status: error.response?.status,
      timestamp: Date.now(),
    };
  },
});

// Override per service
class ProductService extends ApiService {
  constructor() {
    super({
      serviceName: 'products',
      transformError: (error) => {
        // Product-specific error handling
        if (error.response?.status === 404) {
          return { error: 'Product not found' };
        }
        return { error: error.message };
      },
    });
  }
}
```

### Include Response Headers

```typescript
const response = await userService.get({
  endpoint: 'me',
  includeHeaders: true,
});

console.log(response.headers['x-rate-limit-remaining']);
console.log(response.data); // Your actual response data is merged
```

### Query Parameters

```typescript
const users = await userService.get({
  endpoint: 'list',
  params: {
    page: 1,
    limit: 20,
    sort: 'name',
    filter: 'active',
  },
});
// URL: /users/v1/list?page=1&limit=20&sort=name&filter=active
```

### Custom Axios Config

```typescript
const data = await userService.post({
  endpoint: 'upload',
  data: formData,
  config: {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds for large uploads
    onUploadProgress: (progressEvent) => {
      const percent = (progressEvent.loaded / progressEvent.total!) * 100;
      console.log(`Upload: ${percent}%`);
    },
  },
});
```

### Access Axios Instance

```typescript
class CustomService extends ApiService {
  constructor() {
    super({ serviceName: 'custom' });

    // Access raw axios instance
    const axios = this.getAxiosInstance();

    // Add custom interceptors
    axios.interceptors.request.use((config) => {
      config.headers['X-Custom-Header'] = 'value';
      return config;
    });
  }
}
```

---

## 📚 Complete Configuration Example

```typescript
// src/api/config.ts
import { configureBaseService, configureToken } from 'servios';

// 1. Configure token storage (optional)
configureToken({
  // Access token
  tokenKey: 'accessToken',
  storage: 'cookie',
  cookieOptions: {
    secure: true,
    sameSite: 'Strict',
    expires: 7,
  },

  // Refresh token (separate config)
  refreshToken: {
    tokenKey: 'refreshToken',
    storage: 'cookie',
    cookieOptions: {
      secure: true,
      sameSite: 'Strict',
      expires: 30,
    },
  },
});

// 2. Configure base service
configureBaseService({
  // Required
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',

  // Optional: Custom token handlers (or use defaults)
  // getAccessToken, setAccessToken, etc. are auto-handled if not provided

  // Optional: Refresh token logic
  async refreshToken() {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  // Optional: Logout handler
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  },

  // Optional: Retry configuration
  retryOnStatusCodes: [401, 403],

  // Optional: Error transformation
  transformError: (error) => ({
    success: false,
    message: error.response?.data?.message || 'Network error',
    status: error.response?.status,
  }),

  // Optional: Global mock settings
  useMock: import.meta.env.DEV,
  mockDelay: 1000,
});
```

```typescript
// src/api/services/UserService.ts
import { ApiService } from 'servios';

export class UserService extends ApiService {
  constructor() {
    super({
      serviceName: 'users',
      version: 'v2',
      // Override mock for this service
      useMock: import.meta.env.DEV,
      mockDelay: 500,
    });
  }

  getMe() {
    return this.get<{ user: User }>({
      endpoint: 'me',
    });
  }

  updateProfile(data: UpdateProfileDto) {
    return this.patch<{ user: User }>({
      endpoint: 'profile',
      data,
    });
  }

  getUsers(params: { page?: number; limit?: number }) {
    return this.get<{ users: User[]; total: number }>({
      endpoint: 'list',
      params,
    });
  }
}

export default new UserService();
```

```typescript
// src/components/Profile.tsx
import { useEffect, useState } from 'react';
import userService from '@/api/services/UserService';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getMe()
      .then(({ user }) => setUser(user))
      .catch(error => console.error(error));
  }, []);

  return <div>{user?.name}</div>;
}
```

---

## 🎯 Usage Patterns

### Pattern 1: Class-based Service (Recommended)

```typescript
class OrderService extends ApiService {
  constructor() {
    super({ serviceName: 'orders' });
  }

  getAll() {
    return this.get({ endpoint: 'list' });
  }

  getById(id: string) {
    return this.get({ endpoint: `${id}` });
  }

  create(data: CreateOrderDto) {
    return this.post({ endpoint: 'create', data });
  }
}

export default new OrderService();
```

### Pattern 2: Factory Function

```typescript
export const productApi = createService({
  serviceName: 'products',
  version: 'v3',
});

// Usage
const products = await productApi.get({ endpoint: 'list' });
```

### Pattern 3: Direct BaseService

```typescript
const customApi = new BaseService({
  baseURL: 'https://external-api.com',
  serviceName: 'external',
  getAccessToken: () => null, // No auth
  setAccessToken: () => {},
  removeAccessToken: () => {},
  logout: () => {},
});
```

---

## 🔍 API Reference

### HTTP Methods

All methods accept a `RequestConfig<T>` object:

```typescript
interface RequestConfig<T = any> {
  endpoint: string;
  params?: Record<string, any>;
  data?: any;
  version?: string;
  isMock?: boolean;
  mockData?: T;
  mockStatus?: number;
  includeHeaders?: boolean;
  config?: AxiosRequestConfig;
}
```

#### `get<T>(config: RequestConfig<T>): Promise<T>`

```typescript
const user = await service.get<User>({
  endpoint: 'me',
  params: { include: 'profile' },
});
```

#### `post<T>(config: RequestConfig<T>): Promise<T>`

```typescript
const created = await service.post<User>({
  endpoint: 'users',
  data: { name: 'John', email: 'john@example.com' },
});
```

#### `put<T>(config: RequestConfig<T>): Promise<T>`

```typescript
const updated = await service.put<User>({
  endpoint: 'users/123',
  data: { name: 'Jane' },
});
```

#### `patch<T>(config: RequestConfig<T>): Promise<T>`

```typescript
const patched = await service.patch<User>({
  endpoint: 'users/123',
  data: { email: 'newemail@example.com' },
});
```

#### `delete<T>(config: RequestConfig<T>): Promise<T>`

```typescript
await service.delete({
  endpoint: 'users/123',
});
```

### Utility Methods

#### `getAxiosInstance(): AxiosInstance`

Get the underlying Axios instance for custom configuration.

#### `getConfig(): ServiceConfig`

Get the current service configuration.

---

## 📝 TypeScript Support

Full TypeScript support with excellent IDE autocomplete:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

class UserService extends ApiService {
  async getUser(id: string): Promise<User> {
    return this.get<User>({ endpoint: `users/${id}` });
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.patch<User>({
      endpoint: `users/${id}`,
      data,
    });
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](./CONTRIBUTING.md).

---

## 📄 License

MIT © [Arif Hasanov](https://github.com/hesenv07)

---

## 🔗 Links

- [GitHub Repository](https://github.com/hesenv07/servios)
- [npm Package](https://www.npmjs.com/package/servios)
- [Issues](https://github.com/hesenv07/servios/issues)

