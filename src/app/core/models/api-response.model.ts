// Riassunto: Wrapper standard di risposta dal backend usato da BaseService.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
}
