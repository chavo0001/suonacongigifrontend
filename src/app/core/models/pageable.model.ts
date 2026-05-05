// Riassunto: Interfaccia generica per risposte paginabili dal backend.
export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}
