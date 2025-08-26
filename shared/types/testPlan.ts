import { ITestPlan, ITestPlanCreate, ITestPlanUpdate, ITestPlanFilter } from '../interfaces/testPlan/ITestPlan';

export type TestPlanEntity = ITestPlan;
export type TestPlanCreateData = ITestPlanCreate;
export type TestPlanUpdateData = ITestPlanUpdate;
export type TestPlanFilterData = ITestPlanFilter;

export type TestPlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export type TestPlanType = 'functional' | 'integration' | 'system' | 'acceptance' | 'regression' | 'performance';

export type TestPlanPhase = 'planning' | 'execution' | 'reporting' | 'closure';
