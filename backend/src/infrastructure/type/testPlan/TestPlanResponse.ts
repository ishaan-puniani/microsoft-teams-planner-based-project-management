/// File is generated from https://studio.fabbuilder.com - testPlan

import { ITestPlan } from '../../interfaces/testPlan/ITestPlan';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type TestPlanListResponse = ListResponse<ITestPlan>;
export type TestPlanSingleResponse =
  SingleResponse<ITestPlan>;

// Legacy alias for backward compatibility (can be removed later)
export type TestPlanResponse = TestPlanListResponse;

/// File is generated from https://studio.fabbuilder.com - testPlan
