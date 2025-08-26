/// File is generated from https://studio.fabbuilder.com - status

import { IStatus } from '../../interfaces/status/IStatus';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type StatusListResponse = ListResponse<IStatus>;
export type StatusSingleResponse = SingleResponse<IStatus>;

// Legacy alias for backward compatibility (can be removed later)
export type StatusResponse = StatusListResponse;

/// File is generated from https://studio.fabbuilder.com - status
