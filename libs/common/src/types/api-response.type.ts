export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data?: TData;
  statusCode?: number;
  timestamp?: string;
  path?: string;
}
