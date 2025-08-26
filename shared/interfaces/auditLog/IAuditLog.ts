export interface IAuditLog {
  id?: string;
  entityName: string;
  entityId: string;
  action: string;
  tenantId?: string;
  createdById?: string;
  createdByEmail?: string;
  timestamp: Date;
  values?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuditLogCreate {
  entityName: string;
  entityId: string;
  action: string;
  tenantId?: string;
  createdById?: string;
  createdByEmail?: string;
  timestamp: Date;
  values?: any;
}

export interface IAuditLogUpdate {
  entityName?: string;
  entityId?: string;
  action?: string;
  tenantId?: string;
  createdById?: string;
  createdByEmail?: string;
  timestamp?: Date;
  values?: any;
}

export interface IAuditLogFilter {
  entityName?: string;
  entityId?: string;
  action?: string;
  tenantId?: string;
  createdById?: string;
  createdByEmail?: string;
  timestampFrom?: Date;
  timestampTo?: Date;
}
