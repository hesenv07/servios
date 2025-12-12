import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { UseQueryResult } from '@tanstack/react-query';

import { QueryCacheManager } from '../query';

import type { CustomQueryOptions } from './types';

export function useCustomQuery<
  TData,
  TError = unknown,
  // eslint-disable-next-line
  TItem extends { id: string | number } = any,
>(
  options: CustomQueryOptions<TData, TError, TItem>,
): UseQueryResult<TData, TError> & {
  cache: QueryCacheManager<TItem>;
} {
  const { queryKey, cacheConfig = {}, ...rest } = options;

  const queryClient = useQueryClient();

  const queryResult = useQuery<TData, TError>({
    queryKey,
    ...rest,
  });

  const manager = new QueryCacheManager<TItem>({
    queryKey,
    queryClient,
    dataPath: cacheConfig.dataPath ?? [],
    isPaginated: cacheConfig.isPaginated,
    keyExtractor: cacheConfig.keyExtractor,
  });

  return {
    ...queryResult,
    cache: manager,
  };
}
