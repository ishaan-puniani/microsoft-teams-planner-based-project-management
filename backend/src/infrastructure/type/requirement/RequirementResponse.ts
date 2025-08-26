/// File is generated from https://studio.fabbuilder.com - requirement

import { IRequirement } from '../../interfaces/requirement/IRequirement';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type RequirementListResponse =
  ListResponse<IRequirement>;
export type RequirementSingleResponse =
  SingleResponse<IRequirement>;

// Legacy alias for backward compatibility (can be removed later)
export type RequirementResponse = RequirementListResponse;

/// File is generated from https://studio.fabbuilder.com - requirement
