import { ITestCase, ITestCaseCreate, ITestCaseUpdate, ITestCaseFilter } from '../interfaces/testCase/ITestCase';

export type TestCaseEntity = ITestCase;
export type TestCaseCreateData = ITestCaseCreate;
export type TestCaseUpdateData = ITestCaseUpdate;
export type TestCaseFilterData = ITestCaseFilter;

export type TestCasePriority = 'low' | 'medium' | 'high' | 'critical';

export type TestCaseStatus = 'draft' | 'ready' | 'in_progress' | 'passed' | 'failed' | 'blocked' | 'skipped';

export type TestCaseType = 'functional' | 'integration' | 'unit' | 'performance' | 'security' | 'usability';

export type TestCaseStep = {
  stepNumber: number;
  action: string;
  expectedResult: string;
  actualResult?: string;
  status?: 'passed' | 'failed' | 'blocked';
};
