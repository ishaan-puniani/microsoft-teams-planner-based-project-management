import { IBaseFilter } from '../base/IBaseFilter';

export interface IAuditlogFilter extends IBaseFilter {
  action?: string;
  timestampRange?: Array<string>;
  entityId: string;
  createdByEmail: string;
  entityNames: string;
}
