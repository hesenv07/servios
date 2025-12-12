import type { CacheConfig } from '../query';
import type { QueryKey, UseQueryOptions } from '@tanstack/react-query';

export type CustomQueryOptions<
  TData,
  TError = unknown,
  // eslint-disable-next-line
  TItem extends { id?: string | number } = any,
> = UseQueryOptions<TData, TError> & {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  cacheConfig?: Omit<CacheConfig<TItem>, 'queryClient' | 'queryKey'>;
};
