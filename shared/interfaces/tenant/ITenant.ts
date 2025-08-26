export type ITenantPlan = 'free' | 'growth' | 'enterprise';
export type ITenantPlanStatus = 'active' | 'cancel_at_period_end' | 'error';

export interface ITenant {
  id?: string;
  name: string;
  url?: string;
  plan: ITenantPlan;
  planStatus: ITenantPlanStatus;
  planStripeCustomerId?: string;
  planUserId?: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITenantCreate {
  name: string;
  url?: string;
  plan?: ITenantPlan;
  planStatus?: ITenantPlanStatus;
  planStripeCustomerId?: string;
  planUserId?: string;
}

export interface ITenantUpdate {
  name?: string;
  url?: string;
  plan?: ITenantPlan;
  planStatus?: ITenantPlanStatus;
  planStripeCustomerId?: string;
  planUserId?: string;
}

export interface ITenantFilter {
  name?: string;
  url?: string;
  plan?: ITenantPlan;
  planStatus?: ITenantPlanStatus;
  importHash?: string;
}
