import { ITestSuite, ITestSuiteCreate, ITestSuiteUpdate, ITestSuiteFilter } from '../interfaces/testSuite/ITestSuite';

export type TestSuiteEntity = ITestSuite;
export type TestSuiteCreateData = ITestSuiteCreate;
export type TestSuiteUpdateData = ITestSuiteUpdate;
export type TestSuiteFilterData = ITestSuiteFilter;

export type TestSuiteStatus = 'active' | 'inactive' | 'archived';

export type TestSuiteType = 'functional' | 'integration' | 'unit' | 'performance' | 'security' | 'regression';
