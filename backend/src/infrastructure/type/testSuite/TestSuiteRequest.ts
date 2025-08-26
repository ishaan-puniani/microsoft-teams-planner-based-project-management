/// File is generated from https://studio.fabbuilder.com - testSuite

import { ITestSuite } from '../../interfaces/testSuite/ITestSuite';
import { ITestSuiteFilter } from '../../interfaces/testSuite/ITestSuiteFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type TestSuiteRequest =
  FilterableRequest<ITestSuiteFilter>;
export type TestSuiteCreateRequest =
  CreateRequest<ITestSuite>;
export type TestSuiteUpdateRequest =
  UpdateRequest<ITestSuite>;

/// File is generated from https://studio.fabbuilder.com - testSuite
