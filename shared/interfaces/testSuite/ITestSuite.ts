export interface ITestSuite {
  id?: string;
  name?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestSuiteCreate {
  name?: string;
  tenant: string;
}

export interface ITestSuiteUpdate {
  name?: string;
  tenant?: string;
}

export interface ITestSuiteFilter {
  name?: string;
  tenant?: string;
  importHash?: string;
}
