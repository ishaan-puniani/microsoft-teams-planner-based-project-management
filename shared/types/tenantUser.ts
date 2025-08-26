import { ITenantUser, ITenantUserCreate, ITenantUserUpdate, ITenantUserFilter } from '../interfaces/tenantUser/ITenantUser';

export type TenantUserEntity = ITenantUser;
export type TenantUserCreateData = ITenantUserCreate;
export type TenantUserUpdateData = ITenantUserUpdate;
export type TenantUserFilterData = ITenantUserFilter;

export type TenantUserStatus = 'active' | 'invited';

export type TenantUserRole = 'owner' | 'admin' | 'member' | 'viewer';
