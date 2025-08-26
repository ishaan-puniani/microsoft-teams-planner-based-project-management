/// File is generated from https://studio.fabbuilder.com - testCase

import { ITestCase } from '../../interfaces/testCase/ITestCase';
import { ITestCaseFilter } from '../../interfaces/testCase/ITestCaseFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type TestCaseRequest =
  FilterableRequest<ITestCaseFilter>;
export type TestCaseCreateRequest =
  CreateRequest<ITestCase>;
export type TestCaseUpdateRequest =
  UpdateRequest<ITestCase>;

/// File is generated from https://studio.fabbuilder.com - testCase
