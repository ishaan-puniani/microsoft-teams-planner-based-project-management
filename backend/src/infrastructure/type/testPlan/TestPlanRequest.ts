/// File is generated from https://studio.fabbuilder.com - testPlan

import { ITestPlan } from '../../interfaces/testPlan/ITestPlan';
import { ITestPlanFilter } from '../../interfaces/testPlan/ITestPlanFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type TestPlanRequest =
  FilterableRequest<ITestPlanFilter>;
export type TestPlanCreateRequest =
  CreateRequest<ITestPlan>;
export type TestPlanUpdateRequest =
  UpdateRequest<ITestPlan>;

/// File is generated from https://studio.fabbuilder.com - testPlan
