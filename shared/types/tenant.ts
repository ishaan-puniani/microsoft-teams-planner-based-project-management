import { ITenant, ITenantCreate, ITenantUpdate, ITenantFilter, ITenantPlan, ITenantPlanStatus } from '../interfaces/tenant/ITenant';

export type TenantEntity = ITenant;
export type TenantCreateData = ITenantCreate;
export type TenantUpdateData = ITenantUpdate;
export type TenantFilterData = ITenantFilter;

export type TenantPlanType = ITenantPlan;
export type TenantPlanStatusType = ITenantPlanStatus;

export type TenantStatus = 'active' | 'inactive' | 'suspended' | 'pending';
