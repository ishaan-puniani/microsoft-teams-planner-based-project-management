/// File is generated from https://studio.fabbuilder.com -

import { IFilterableRequest } from '../../interfaces/base/IFilterableRequest';

/**
 * Generic list response type that can be reused across all entities
 * @template T - The entity type
 */
export type ListResponse<T> = {
  rows: T[];
  count: number;
};

/**
 * Generic single response type that can be reused across all entities
 * @template T - The entity type
 */
export type SingleResponse<T> = T;

/**
 * Generic request type that can be reused across entities
 * @template TFilter - The filter type
 */
export type FilterableRequest<TFilter> =
  IFilterableRequest<TFilter>;

/**
 * Generic create request type
 * @template T - The entity creation data type
 */
export type CreateRequest<T> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Generic update request type
 * @template T - The entity type
 */
export type UpdateRequest<T> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
>;

/// File is generated from https://studio.fabbuilder.com -
