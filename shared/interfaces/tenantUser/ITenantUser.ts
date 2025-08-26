export interface ITenantUser {
  id?: string;
  tenant: string;
  roles?: string[];
  invitationToken?: string;
  status: 'active' | 'invited';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITenantUserCreate {
  tenant: string;
  roles?: string[];
  invitationToken?: string;
  status: 'active' | 'invited';
}

export interface ITenantUserUpdate {
  tenant?: string;
  roles?: string[];
  invitationToken?: string;
  status?: 'active' | 'invited';
}

export interface ITenantUserFilter {
  tenant?: string;
  status?: 'active' | 'invited';
}
