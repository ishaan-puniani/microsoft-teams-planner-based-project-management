/// File is generated from https://studio.fabbuilder.com - testCase

import { ITestCase } from '../../interfaces/testCase/ITestCase';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type TestCaseListResponse = ListResponse<ITestCase>;
export type TestCaseSingleResponse =
  SingleResponse<ITestCase>;

// Legacy alias for backward compatibility (can be removed later)
export type TestCaseResponse = TestCaseListResponse;

/// File is generated from https://studio.fabbuilder.com - testCase
