import { IAuditLog, IAuditLogCreate, IAuditLogUpdate, IAuditLogFilter } from '../interfaces/auditLog/IAuditLog';

export type AuditLogEntity = IAuditLog;
export type AuditLogCreateData = IAuditLogCreate;
export type AuditLogUpdateData = IAuditLogUpdate;
export type AuditLogFilterData = IAuditLogFilter;

export type AuditLogAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'import';

export type AuditLogEntityType = 
  | 'user'
  | 'tenant'
  | 'task'
  | 'module'
  | 'requirement'
  | 'status'
  | 'tag'
  | 'testCase'
  | 'testPlan'
  | 'testSuite'
  | 'settings'
  | 'auditLog';
