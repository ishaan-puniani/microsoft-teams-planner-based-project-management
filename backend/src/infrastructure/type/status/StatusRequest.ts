/// File is generated from https://studio.fabbuilder.com - status

import { IStatus } from '../../interfaces/status/IStatus';
import { IStatusFilter } from '../../interfaces/status/IStatusFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type StatusRequest =
  FilterableRequest<IStatusFilter>;
export type StatusCreateRequest = CreateRequest<IStatus>;
export type StatusUpdateRequest = UpdateRequest<IStatus>;

/// File is generated from https://studio.fabbuilder.com - status
