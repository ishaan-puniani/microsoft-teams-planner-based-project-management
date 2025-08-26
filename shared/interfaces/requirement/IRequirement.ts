export interface IRequirement {
  id?: string;
  title?: string;
  background?: string;
  acceptanceCriteria?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRequirementCreate {
  title?: string;
  background?: string;
  acceptanceCriteria?: string;
  tenant: string;
}

export interface IRequirementUpdate {
  title?: string;
  background?: string;
  acceptanceCriteria?: string;
  tenant?: string;
}

export interface IRequirementFilter {
  title?: string;
  tenant?: string;
  importHash?: string;
}
