/// File is generated from https://studio.fabbuilder.com - testSuite

import { ITestSuite } from '../../interfaces/testSuite/ITestSuite';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type TestSuiteListResponse =
  ListResponse<ITestSuite>;
export type TestSuiteSingleResponse =
  SingleResponse<ITestSuite>;

// Legacy alias for backward compatibility (can be removed later)
export type TestSuiteResponse = TestSuiteListResponse;

/// File is generated from https://studio.fabbuilder.com - testSuite
