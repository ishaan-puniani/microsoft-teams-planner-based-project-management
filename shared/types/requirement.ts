import { IRequirement, IRequirementCreate, IRequirementUpdate, IRequirementFilter } from '../interfaces/requirement/IRequirement';

export type RequirementEntity = IRequirement;
export type RequirementCreateData = IRequirementCreate;
export type RequirementUpdateData = IRequirementUpdate;
export type RequirementFilterData = IRequirementFilter;

export type RequirementPriority = 'low' | 'medium' | 'high' | 'critical';

export type RequirementStatus = 'draft' | 'review' | 'approved' | 'implemented' | 'verified';

export type RequirementType = 'functional' | 'non-functional' | 'business' | 'user' | 'system';
