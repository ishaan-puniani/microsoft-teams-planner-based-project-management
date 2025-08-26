import { IAuditlogFilter } from '../../interfaces/auditLogs/IAuditLogFilter';
import { IFilterableRequest } from '../../interfaces/base/IFilterableRequest';

export type AuditLogListRequest =
  IFilterableRequest<IAuditlogFilter>;
