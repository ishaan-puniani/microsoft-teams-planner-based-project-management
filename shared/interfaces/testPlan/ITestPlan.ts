export interface ITestPlan {
  id?: string;
  title?: string;
  scope?: string;
  objective?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestPlanCreate {
  title?: string;
  scope?: string;
  objective?: string;
  tenant: string;
}

export interface ITestPlanUpdate {
  title?: string;
  scope?: string;
  objective?: string;
  tenant?: string;
}

export interface ITestPlanFilter {
  title?: string;
  tenant?: string;
  importHash?: string;
}
