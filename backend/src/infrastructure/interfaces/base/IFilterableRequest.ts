export interface IFilterableRequest<T> {
  filter: T;
  limit: number;
  offset: number;
  orderBy: string;
  query?: string;
  ids?: unknown;
  countOnly?: boolean;
}
