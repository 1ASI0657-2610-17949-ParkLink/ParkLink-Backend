import type { ApiResponse } from '../types/api-response.type';

interface MaybeApiResponse<TData> {
  success?: unknown;
  data?: TData;
}

function isApiResponse<TData>(value: unknown): value is ApiResponse<TData> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as MaybeApiResponse<TData>).success === 'boolean'
  );
}

export function unwrapApiResponse<TData>(payload: ApiResponse<TData> | TData): TData {
  if (isApiResponse<TData>(payload)) {
    return payload.data as TData;
  }

  return payload;
}
