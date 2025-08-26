/// File is generated from https://studio.fabbuilder.com - requirement

import { IRequirement } from '../../interfaces/requirement/IRequirement';
import { IRequirementFilter } from '../../interfaces/requirement/IRequirementFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type RequirementRequest =
  FilterableRequest<IRequirementFilter>;
export type RequirementCreateRequest =
  CreateRequest<IRequirement>;
export type RequirementUpdateRequest =
  UpdateRequest<IRequirement>;

/// File is generated from https://studio.fabbuilder.com - requirement
